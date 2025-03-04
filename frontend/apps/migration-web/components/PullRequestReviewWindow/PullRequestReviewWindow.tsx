'use client'

import { type FormEvent, useEffect, useRef, useState } from 'react'
import styles from './PullRequestReviewWindow.module.css'

type ReviewWindowProps = {
  endpoint: string
  placeholder: string
}

export const PullRequestReviewWindow = ({ endpoint, placeholder }: ReviewWindowProps) => {
  const [prUrl, setPrUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [reviewResult, setReviewResult] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const resultContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (resultContainerRef.current) {
      resultContainerRef.current.scrollTop = resultContainerRef.current.scrollHeight
    }
  }, [reviewResult])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!prUrl.trim()) {
      setError('Please enter a valid GitHub Pull Request URL')
      return
    }

    setIsLoading(true)
    setError(null)
    setReviewResult('')

    try {
      const response = await fetch(`/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prUrl }),
      })

      if (!response.ok) {
        throw new Error(`An error occurred: ${response.statusText}`)
      }

      if (!response.body) {
        throw new Error('Response body is empty')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        setReviewResult((prev) => prev + text)
      }
    } catch (err) {
      console.error('Error during review:', err)
      setError(
        err instanceof Error ? err.message : 'An error occurred during review',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setPrUrl('')
    setReviewResult('')
    setError(null)
  }

  return (
    <div className={styles.reviewWindow}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputContainer}>
          <input
            ref={inputRef}
            type="text"
            value={prUrl}
            onChange={(e) => setPrUrl(e.target.value)}
            placeholder={placeholder}
            className={styles.urlInput}
            disabled={isLoading}
          />
        </div>
        <div className={styles.controls}>
          <button
            type="submit"
            className={styles.reviewButton}
            disabled={isLoading || !prUrl.trim()}
          >
            {isLoading ? 'Reviewing...' : 'Review'}
          </button>
          {reviewResult && (
            <button
              type="button"
              onClick={handleReset}
              className={styles.resetButton}
              disabled={isLoading}
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.resultContainer}>
        {reviewResult ? (
          <div ref={resultContainerRef} className={styles.reviewResult}>
            {reviewResult}
          </div>
        ) : (
          isLoading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>AI is analyzing the PR changes...</p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
