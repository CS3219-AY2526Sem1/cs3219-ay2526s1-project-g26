import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import { DragIndicator } from '@mui/icons-material'
import QuestionPanel from '../components/question/QuestionPanel'
import { useQuestion } from '../hooks/useQuestion'

const Collaboration = () => {
  const { question, loading, error, fetchQuestionById } = useQuestion()
  const [leftWidth, setLeftWidth] = useState(() => {
    // 从localStorage读取用户偏好，默认50%
    const saved = localStorage.getItem('collaboration-panel-width')
    return saved ? parseFloat(saved) : 50
  })
  const [isDragging, setIsDragging] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 加载问题（暂时使用固定ID=1）
  useEffect(() => {
    console.log('Loading question with ID: 1...')
    fetchQuestionById(1)
  }, [fetchQuestionById])

  // 处理鼠标拖动
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    
    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
    
    // 限制最小和最大宽度（20% - 80%）
    const clampedWidth = Math.max(20, Math.min(80, newLeftWidth))
    setLeftWidth(clampedWidth)
    
    // 保存到localStorage
    localStorage.setItem('collaboration-panel-width', clampedWidth.toString())
  }, [isDragging])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // 添加全局鼠标事件
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
        overflow: 'hidden'
      }}
    >
      {/* 左侧：问题面板 */}
      <Box 
        sx={{ 
          width: `${leftWidth}%`,
          minWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default'
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

      {/* 可拖动的分隔条 */}
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
          position: 'relative'
        }}
      >
        <DragIndicator 
          sx={{ 
            color: 'text.secondary',
            fontSize: '16px',
            rotate: '90deg'
          }} 
        />
      </Box>

      {/* 右侧：代码编辑器区域 */}
      <Box 
        sx={{ 
          width: `${100 - leftWidth}%`,
          minWidth: '300px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default'
        }}
      >
        {/* <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          Code Editor
        </Typography> */}
        <Box sx={{ flex: 1, p: 2 }}>
          <Paper
            elevation={1}
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Code editor will be implemented here
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default Collaboration