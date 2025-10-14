import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Box } from '@mui/material'
import { DragIndicator } from '@mui/icons-material'
import QuestionPanel from '../components/question/QuestionPanel'
import { useQuestion } from '../hooks'
import CollaborationRightPanel from '../components/collaboration_space/right_panel'

const Collaboration = () => {
  const { question, loading, error, fetchQuestionById } = useQuestion()
  const [leftWidth, setLeftWidth] = useState(() => {
    // 从localStorage, default width 50%
    const saved = localStorage.getItem('collaboration-panel-width')
    return saved ? parseFloat(saved) : 50
  })
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // load question (temporarily using fixed ID=1)
  useEffect(() => {
    console.log('Loading question with ID: 8...')
    fetchQuestionById('68e92415d977f66dd64f8810')
  }, [fetchQuestionById])

  // Handle mouse drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100

      // minimum and maximum (20% - 80%)
      const clampedWidth = Math.max(20, Math.min(80, newLeftWidth))
      setLeftWidth(clampedWidth)

      // safe to localStorage
      localStorage.setItem('collaboration-panel-width', clampedWidth.toString())
    },
    [isDragging]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add/remove global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* left: question panel */}
      <Box
        sx={{
          width: `${leftWidth}%`,
          minWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
        }}
      >
        {/* <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          Problem {loading && '(Loading...)'} {error && '(Error)'} {question && '(Loaded)'}
        </Typography> */}
        <Box sx={{ flex: 1, overflow: 'hidden', p: 2 }}>
          <QuestionPanel
            question={question || undefined}
            loading={loading}
            error={error || undefined}
          />
        </Box>
      </Box>

      {/* draggable separator */}
      <Box
        onMouseDown={handleMouseDown}
        sx={{
          width: '8px',
          backgroundColor: isDragging ? 'primary.main' : 'divider',
          cursor: 'col-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: isDragging ? 'none' : 'background-color 0.2s',
          '&:hover': {
            backgroundColor: 'primary.light',
          },
          position: 'relative',
        }}
      >
        <DragIndicator
          sx={{
            color: 'text.secondary',
            fontSize: '16px',
            rotate: '90deg',
          }}
        />
      </Box>

      {/* right: code editor area */}
      <Box
        sx={{
          width: `${100 - leftWidth}%`,
          minWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
        }}
      >
        <CollaborationRightPanel roomId="12" />
      </Box>
    </Box>
  )
}

export default Collaboration
