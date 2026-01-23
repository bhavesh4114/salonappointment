import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export const useBarberProfile = () => {
  const [barberProfile, setBarberProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBarberProfile = async () => {
      try {
        // Read barber token ONLY from 'barberToken' key
        const token = localStorage.getItem('barberToken')
        
        // If token is missing, immediately redirect to login
        if (!token) {
          localStorage.removeItem('barberToken')
          localStorage.removeItem('user')
          navigate('/login')
          setLoading(false)
          return
        }

        // Call API with token in Authorization header
        const response = await fetch('http://localhost:5000/api/barbers/profile/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setBarberProfile(data.barber)
        } else if (response.status === 401) {
          // Handle 401: remove token and redirect to login
          localStorage.removeItem('barberToken')
          localStorage.removeItem('user')
          navigate('/login')
          setBarberProfile(null)
        } else {
          console.error('Failed to fetch barber profile:', response.status, response.statusText)
        }
      } catch (error) {
        console.error('Error fetching barber profile:', error)
      } finally {
        setLoading(false)
      }
    }

    // Only fetch if barberToken exists
    const token = localStorage.getItem('barberToken')
    if (token) {
      fetchBarberProfile()
    } else {
      // No token, redirect to login
      navigate('/login')
      setLoading(false)
    }
  }, [navigate])

  return { barberProfile, loading }
}
