import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const useBarberProfile = () => {
  const [barberProfile, setBarberProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    console.log('[useBarberProfile] useEffect triggered, token:', token ? 'present' : 'null')
    
    const fetchBarberProfile = async () => {
      // Use token from AuthContext, not localStorage directly
      if (!token) {
        console.log('[useBarberProfile] No token found, redirecting to login')
        navigate('/login', { replace: true })
        setLoading(false)
        return
      }

      try {
        console.log('[useBarberProfile] Fetching barber profile...')
        const response = await fetch('http://localhost:5000/api/barbers/profile/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          console.log('[useBarberProfile] Profile fetched successfully')
          setBarberProfile(data.barber)
        } else if (response.status === 401) {
          console.log('[useBarberProfile] 401 Unauthorized, redirecting to login')
          navigate('/login', { replace: true })
          setBarberProfile(null)
        } else {
          console.error('[useBarberProfile] Failed to fetch barber profile:', response.status)
        }
      } catch (error) {
        console.error('[useBarberProfile] Error fetching barber profile:', error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchBarberProfile()
    } else {
      // No token, don't redirect immediately - let auth loading finish first
      console.log('[useBarberProfile] No token, waiting for auth...')
      setLoading(false)
    }
  }, [token, navigate])

  return { barberProfile, loading }
}
