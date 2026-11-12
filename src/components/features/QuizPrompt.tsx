'use client'

import { useEffect, useState } from 'react'
import QuickQuestions, { QUIZ_DISMISSED_KEY, syncStoredAnswers } from './QuickQuestions'

/**
 * The questionnaire, asked once of signed-in members on the board.
 *
 * The questionnaire left the sign-up path on 8 August and lived only on the
 * home page, which most members never see again after signing up: by 12
 * November 2 of 221 profiles held answers. Sign-up lands on /jobs, so this asks
 * there, once, after answers given signed-out have been carried over. Skipping
 * or closing it is remembered on the device, and the home page keeps a "Change
 * your answers" link for anyone who wants it later.
 */
export default function QuizPrompt() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let live = true
    try {
      if (localStorage.getItem(QUIZ_DISMISSED_KEY)) return
    } catch {
      return
    }
    ;(async () => {
      const state = await syncStoredAnswers()
      if (state === 'ask' && live) setTimeout(() => live && setOpen(true), 1200)
    })()
    return () => { live = false }
  }, [])

  if (!open) return null
  return <QuickQuestions variant="modal" onClose={() => setOpen(false)} />
}
