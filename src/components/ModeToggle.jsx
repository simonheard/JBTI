import { Stack, Switch, Typography } from '@mui/material';
import { MODES } from '../data/jbti.js';

export default function ModeToggle({ mode, onChange }) {
  const isDirect = mode === 'direct';

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      sx={{
        p: 1,
        px: 1.5,
        borderRadius: 999,
        bgcolor: 'rgba(255,255,255,0.62)',
        width: 'fit-content',
      }}
    >
      <Typography
        variant="body2"
        color={isDirect ? 'text.secondary' : 'text.primary'}
        fontWeight={700}
      >
        {MODES.conservative.label}
      </Typography>
      <Switch
        checked={isDirect}
        onChange={(event) =>
          onChange(event.target.checked ? 'direct' : 'conservative')
        }
        color="secondary"
      />
      <Typography
        variant="body2"
        color={isDirect ? 'text.primary' : 'text.secondary'}
        fontWeight={700}
      >
        {MODES.direct.label}
      </Typography>
    </Stack>
  );
}
