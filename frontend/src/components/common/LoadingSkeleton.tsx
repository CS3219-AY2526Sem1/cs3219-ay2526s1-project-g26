import React from 'react'
import { Box, Skeleton } from '@mui/material'

const LoadingSkeleton = () => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', bgcolor: '#f5f5f5' }}>
      <Box
        sx={{
          width: 240,
          p: 2,
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Skeleton
          variant="rectangular"
          width={180}
          height={40}
          sx={{ borderRadius: 1 }}
        />
        {[...Array(5)].map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            width={200}
            height={30}
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Box>

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            height: 64,
            px: 3,
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={200} height={30} />
        </Box>

        <Box
          sx={{
            flex: 1,
            p: 3,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
            gap: 3,
          }}
        >
          {[...Array(6)].map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={150}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default LoadingSkeleton
