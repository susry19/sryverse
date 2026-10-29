import { createContext, useContext } from 'react'

/* Sahneler arası tek iplik: ihtiyaçta açılan pozisyon eşleşmeye, eşleşmede
   seçilen aday ön görüşmeye taşınır. */
export const Journey = createContext(null)
export const useJourney = () => useContext(Journey)
