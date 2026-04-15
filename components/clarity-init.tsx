'use client'

import { useEffect } from 'react'
import Clarity from '@microsoft/clarity'

export default function ClarityInit() {
  useEffect(() => {
    Clarity.init('w94a8bxaz8')
  }, [])

  return null
}
