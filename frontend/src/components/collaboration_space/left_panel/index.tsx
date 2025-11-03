import QuestionPanel from '../../common/QuestionPanel.tsx'
import React from 'react'
import { Question } from '../../../types/question.ts'
import { Box, Tab, Tabs } from '@mui/material'
import CodeTranslationPanel from './CodeTranslationPanel'
import { type WebsocketProvider } from '../../../utils/y-websocket'

// Source: https://mui.com/material-ui/react-tabs/
interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      style={{
        flexGrow: 1,
        overflowY: 'auto',
        minHeight: 0,
      }}
    >
      {value === index && children}
    </div>
  )
}

interface LeftPanelProps {
  question: Question | undefined
  provider: WebsocketProvider | undefined
}

const LeftPanel = (props: LeftPanelProps) => {
  const [value, setValue] = React.useState(0)

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Description" id={'tab-0'} aria-controls="tabpanel-0" />
          <Tab
            label="Code Translation"
            id={'tab-1'}
            aria-controls="tabpanel-1"
          />
          <Tab label="Submissions" id={'tab-2'} aria-controls="tabpanel-2" />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <QuestionPanel question={props.question || undefined} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <CodeTranslationPanel provider={props.provider} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        Submissions Page (Reserved)
      </CustomTabPanel>
    </Box>
  )
}

export default LeftPanel
