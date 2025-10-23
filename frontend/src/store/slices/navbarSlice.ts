import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TABS } from '../../constants/navbarTabs.ts'

const defaultTab = TABS[0]

interface NavbarTab {
  id: string
  label: string
  pathname: string
}

interface NavbarState {
  activeTab: NavbarTab
  lastCollaborationId?: string
}

const initialState: NavbarState = {
  activeTab: defaultTab,
}

const navbarSlice = createSlice({
  name: 'navbar',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<NavbarTab | undefined>) => {
      state.activeTab = action.payload || defaultTab
    },
    setLastCollaborationId: (
      state,
      action: PayloadAction<string | undefined>
    ) => {
      state.lastCollaborationId = action.payload
    },
    resetTab: (state) => {
      state.activeTab = defaultTab
    },
  },
})

export const { setActiveTab, setLastCollaborationId, resetTab } =
  navbarSlice.actions
export default navbarSlice.reducer
