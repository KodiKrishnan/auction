import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Divider, Stack, TextField, Autocomplete, IconButton, Menu, MenuItem } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SearchIcon from '@mui/icons-material/Search';
import LocationIcon from '@mui/icons-material/MyLocation';

const autocompleteService = { current: null };

export default function SearchBar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Search details states
  const [locationInput, setLocationInput] = useState(searchParams.get('destination') || '');
  const [latitude, setLatitude] = useState(searchParams.get('lat') || '');
  const [longitude, setLongitude] = useState(searchParams.get('lng') || '');
  const [stayFrom, setStayFrom] = useState(searchParams.get('checkIn') || '');
  const [stayTo, setStayTo] = useState(searchParams.get('checkOut') || '');
  
  const [guestAnchorEl, setGuestAnchorEl] = useState(null);
  const isGuestMenuOpen = Boolean(guestAnchorEl);
  const [guestsCount, setGuestsCount] = useState(Number(searchParams.get('guests')) || 0);

  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [options, setOptions] = useState([]);
  const [inputValue, setInputValue] = useState(searchParams.get('destination') || '');

  // Load Google Places Script Once
  useEffect(() => {
    if (window.google && window.google.maps) {
      setGoogleLoaded(true);
      return;
    }
    const scriptId = 'google-maps-places-script';
    if (document.getElementById(scriptId)) {
      setGoogleLoaded(true);
      return;
    }
    const googleKey = import.meta.env.VITE_API_GOOGLE_KEY;
    if (!googleKey) return;

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Fetch Predictions
  useEffect(() => {
    let active = true;
    if (!googleLoaded || !inputValue.trim()) {
      setOptions([]);
      return undefined;
    }
    if (!autocompleteService.current && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) return undefined;

    const delayDebounceFn = setTimeout(() => {
      autocompleteService.current.getPlacePredictions(
        { input: inputValue },
        (predictions, status) => {
          if (active) {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              setOptions(predictions);
            } else {
              setOptions([]);
            }
          }
        }
      );
    }, 300);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [inputValue, googleLoaded]);

  const handleAddressSelect = (event, newValue) => {
    if (!newValue) {
      setLocationInput('');
      setLatitude('');
      setLongitude('');
      setInputValue('');
      return;
    }
    const mapElement = document.createElement("div");
    const placesService = new window.google.maps.places.PlacesService(mapElement);
    placesService.getDetails(
      { placeId: newValue.place_id, fields: ["geometry"] },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
          setLatitude(place.geometry.location.lat());
          setLongitude(place.geometry.location.lng());
          setLocationInput(newValue.description);
          setInputValue(newValue.description);
        }
      }
    );
  };

  const handleSearchSubmit = () => {
    const params = { destination: locationInput, checkIn: stayFrom, checkOut: stayTo };
    if (guestsCount > 0) params.guests = guestsCount;
    const queryParams = new URLSearchParams(params);
    if (latitude && longitude) {
      queryParams.append('lat', latitude);
      queryParams.append('lng', longitude);
    }
    navigate(`/traveller/properties?${queryParams.toString()}`);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 850 }}>
      <Paper
        elevation={0}
        sx={{
          display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'stretch', md: 'center' },
          border: '1px solid #E5E7EB', borderRadius: { xs: '16px', md: '40px' }, overflow: 'hidden',
          bgcolor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', p: 0.8, pl: { md: 3 }
        }}
      >
        {/* Where */}
        <Stack spacing={0.1} sx={{ flex: 1.4, px: 1.5, py: 0.5 }}>
          <Typography sx={{ fontSize: 9, fontWeight: 800, color: '#1E1154', textTransform: 'uppercase', letterSpacing: 0.5 }}>Where</Typography>
          <Autocomplete
            getOptionLabel={(option) => typeof option === 'string' ? option : option.description}
            filterOptions={(x) => x}
            options={options}
            autoComplete
            includeInputInList
            filterSelectedOptions
            isOptionEqualToValue={(option, val) => option.description === val.description}
            noOptionsText={inputValue === '' ? "Start typing..." : "No matching locations found"}
            value={locationInput ? { description: locationInput } : null}
            onChange={handleAddressSelect}
            onInputChange={(event, newInputValue, reason) => {
              setInputValue(newInputValue || '');
              setLocationInput(newInputValue || '');
              if (reason === 'input') { setLatitude(''); setLongitude(''); }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Find your next stay..."
                variant="standard"
                sx={{
                  '& .MuiInput-underline:before': { borderBottom: 'none !important' },
                  '& .MuiInput-underline:after': { borderBottom: 'none !important' },
                  '& input': { fontSize: 13, fontWeight: 500, p: 0 }
                }}
              />
            )}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props;
              return (
                <Box key={key} component="li" {...optionProps}>
                  <LocationIcon sx={{ color: 'text.secondary', mr: 2, width: 20 }} />
                  <Typography variant="body2" color="text.primary">
                    {option.structured_formatting?.main_text || option.description}
                    <Typography component="span" variant="caption" color="text.secondary" display="block">
                      {option.structured_formatting?.secondary_text}
                    </Typography>
                  </Typography>
                </Box>
              );
            }}
          />
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, my: 1, mx: 0.5 }} />

        {/* Check In */}
        <Stack spacing={0.1} sx={{ flex: 1, px: 1.5, py: 0.5 }}>
          <Typography sx={{ fontSize: 9, fontWeight: 800, color: '#1E1154', textTransform: 'uppercase', letterSpacing: 0.5 }}>Check in</Typography>
          <TextField
            type="date" value={stayFrom} onChange={(e) => setStayFrom(e.target.value)} variant="standard"
            sx={{ '& .MuiInput-underline:before': { borderBottom: 'none !important' }, '& input': { fontSize: 12.5, fontWeight: 500, p: 0 } }}
          />
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, my: 1, mx: 0.5 }} />

        {/* Check Out */}
        <Stack spacing={0.1} sx={{ flex: 1, px: 1.5, py: 0.5 }}>
          <Typography sx={{ fontSize: 9, fontWeight: 800, color: '#1E1154', textTransform: 'uppercase', letterSpacing: 0.5 }}>Check out</Typography>
          <TextField
            type="date" value={stayTo} onChange={(e) => setStayTo(e.target.value)} variant="standard"
            sx={{ '& .MuiInput-underline:before': { borderBottom: 'none !important' }, '& input': { fontSize: 12.5, fontWeight: 500, p: 0 } }}
          />
        </Stack>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', md: 'block' }, my: 1, mx: 0.5 }} />

        {/* Guests */}
        <Stack
          spacing={0.1}
          sx={{ flex: 0.8, px: 1.5, py: 0.5, cursor: 'pointer', userSelect: 'none', '&:hover': { opacity: 0.85 } }}
          onClick={(e) => setGuestAnchorEl(e.currentTarget)}
        >
          <Typography sx={{ fontSize: 9, fontWeight: 800, color: '#1E1154', textTransform: 'uppercase', letterSpacing: 0.5 }}>Who</Typography>
          <Typography sx={{ fontSize: 13, fontWeight: 600, color: guestsCount > 0 ? '#374151' : '#9CA3AF', mt: 0.5 }}>
            {guestsCount > 0 ? `${guestsCount} Guest${guestsCount > 1 ? 's' : ''}` : 'Add guests'}
          </Typography>
        </Stack>

        <Box sx={{ p: 0.2, display: 'flex', alignItems: 'center', justifyContent: 'center', ml: 'auto', pl: { md: 1 } }}>
          <IconButton onClick={handleSearchSubmit} sx={{ bgcolor: '#5E35B1', color: 'white', width: 42, height: 42, '&:hover': { bgcolor: '#4527A0' } }}>
            <SearchIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Paper>

      {/* Guest popover */}
      <Menu
        anchorEl={guestAnchorEl} open={isGuestMenuOpen} onClose={() => setGuestAnchorEl(null)}
        slotProps={{ paper: { sx: { mt: 2, p: 2, width: 260, borderRadius: '16px', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)', border: '1px solid #E5E7EB' } } }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1E1154' }}>Guests</Typography>
            <Typography sx={{ fontSize: 10.5, color: '#9CA3AF', fontWeight: 500 }}>Number of travellers</Typography>
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <IconButton size="small" disabled={guestsCount <= 0} onClick={() => setGuestsCount(prev => prev - 1)} sx={{ border: '1px solid #E5E7EB', width: 30, height: 30, color: '#5E35B1' }}><RemoveIcon sx={{ fontSize: 15 }} /></IconButton>
            <Typography sx={{ fontSize: 14, fontWeight: 700, width: 16, textAlign: 'center', color: '#1E1154' }}>{guestsCount}</Typography>
            <IconButton size="small" disabled={guestsCount >= 20} onClick={() => setGuestsCount(prev => prev + 1)} sx={{ border: '1px solid #E5E7EB', width: 30, height: 30, color: '#5E35B1' }}><AddIcon sx={{ fontSize: 15 }} /></IconButton>
          </Stack>
        </Stack>
      </Menu>
    </Box>
  );
}