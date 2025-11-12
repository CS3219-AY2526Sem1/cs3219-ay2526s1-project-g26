/**
 * AI Assistance Disclosure:
 * Tool: GEMINI 2.5 Pro, date: 2025‑10-23
 * Scope: Generated UI implementation of a ResizeHandle.
 * Author review: I validated correctness, edited for style.
 */

import { styled } from '@mui/material/styles'
import { PanelResizeHandle } from 'react-resizable-panels'

const StyledPanelResizeHandle = styled(PanelResizeHandle)(({ theme }) => ({
  background: theme.palette.background.default,
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.shortest,
  }),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1,
  border: '1px solid',
  borderColor: theme.palette.divider,

  '&[data-direction="horizontal"]': {
    width: '10px',
    borderLeft: 'none',
    borderRight: 'none',
  },
  '&[data-direction="vertical"]': {
    height: '10px',
    borderTop: 'none',
    borderBottom: 'none',
  },

  '&:hover, &[data-resize-handle-active]': {
    background: theme.palette.primary.light,
    borderColor: theme.palette.primary.main,
    '&::before': {
      '--dot-color': theme.palette.common.white,
    },
  },

  '&[data-direction="vertical"]::before': {
    content: '""',
    display: 'block',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: 'var(--dot-color, #888)',
    boxShadow:
      '6px 0 0 0 var(--dot-color, #888), -6px 0 0 0 var(--dot-color, #888)',
  },

  '&[data-direction="horizontal"]::before': {
    content: '""',
    display: 'block',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: 'var(--dot-color, #888)',
    boxShadow:
      '0 6px 0 0 var(--dot-color, #888), 0 -6px 0 0 var(--dot-color, #888)',
  },
}))

export default StyledPanelResizeHandle
