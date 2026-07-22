import {
  isRequired, isEmail, isPhone, minLength, isAdult, isLatitude, isLongitude, minValue, isNonEmptyArray,
  minVisibleCharacters, maxVisibleCharacters, isValidNameChars, isRoundFigure
} from './rules';


export const registrationSchema = () => ({
  email: [
    { test: isRequired, message: 'Email is required' },
    { test: isEmail, message: 'Invalid email address' },
  ],
});



export const profileCompletionSchema = () => ({
  firstName: [
    { test: isRequired, message: 'First name is required' },
    { test: minLength(2), message: 'At least 2 characters' },
  ],
  lastName: [
    { test: isRequired, message: 'Last name is required' },
  ],
  phoneNumber: [
    { test: isRequired, message: 'Mobile number is required' },
    { test: isPhone, message: 'Invalid mobile number' },
  ],
  dob: [
    { test: isRequired, message: 'Date of birth is required' },

    { test: isAdult, message: 'User must be at least 18 years old' },
  ],
});






export const propertyListingSchema = () => ({
  property_name: [
    { test: isRequired, message: 'Property name is required' },
    { test: minLength(5), message: 'Name should be at least 5 characters' },
  ],
  property_type_id: [
    { test: isRequired, message: 'Please select a property type' },
  ],
  description: [
    { test: isRequired, message: 'Description is required' },
    { test: minVisibleCharacters(3), message: 'Please provide a more detailed description' },
    { test: maxVisibleCharacters(5000), message: 'Description cannot exceed 5000 characters' }
  ],
  country: [{ test: isRequired, message: 'Country is required' }],
  state: [{ test: isRequired, message: 'State is required' }],
  city: [{ test: isRequired, message: 'City is required' }],
  address: [{ test: isRequired, message: 'Street address is required' }],
  pincode: [{ test: isRequired, message: 'Pincode is required' }],


  latitude: [
    { test: isRequired, message: 'Latitude is required' },
    { test: isLatitude, message: 'Latitude must be between -90 and 90' }
  ],
  longitude: [
    { test: isRequired, message: 'Longitude is required' },
    { test: isLongitude, message: 'Longitude must be between -180 and 180' }
  ],

  max_guests: [
    { test: minValue(1), message: 'At least 1 guest is required' },
  ],
  bedrooms: [
    { test: minValue(1), message: 'At least 1 bedroom is required' },
  ],
  amenity_ids: [
    { test: isNonEmptyArray, message: 'Please select at least one amenity' },
  ],
});


export const ruleSchema = () => ({
  ruleName: [
    { test: isRequired, message: 'Rule name is required' },
    { test: minLength(3), message: 'Must be at least 3 characters' },
    { test: isValidNameChars, message: 'Special characters are not allowed' }
  ],
  packageType: [
    { test: isRequired, message: 'Package type is required' }
  ],
  validFrom: [
    { test: isRequired, message: 'Valid from date is required' }
  ],
  validTo: [
    { test: isRequired, message: 'Valid to date is required' }
  ],
  checkinDay: [
    { test: isRequired, message: 'Check-in day is required' }
  ],
  checkoutDay: [
    { test: isRequired, message: 'Check-out day is required' }
  ],
  baseCost: [
    { test: isRequired, message: 'Base cost is required' },
    { test: minValue(1), message: 'Must be greater than 0' }
  ],
  bidIncrement: [
    { test: isRequired, message: 'Bid increment is required' },
    { test: minValue(1), message: 'Must be greater than 0' },
    { test: isRoundFigure, message: 'Must be a round figure (no decimals)' }
  ],
  bidStartBefore: [
    { test: isRequired, message: 'Required' },
    { test: minValue(1), message: 'Must be positive' }
  ],
  bidCloseBefore: [
    { test: isRequired, message: 'Required' },
    { test: minValue(1), message: 'Must be positive' }
  ]
});



export const mappingSchema = () => ({
  propertyId: [
    { test: isRequired, message: 'Property is required' }
  ],
  ruleId: [
    { test: isRequired, message: 'Rule is required' }
  ],
  effectiveFrom: [
    { test: isRequired, message: 'Start date is required' }
  ],
  effectiveTo: [
    { test: isRequired, message: 'End date is required' }
  ]
});



export const kycUploadSchema = () => ({
  file: [
    { test: isRequired, message: 'Please select a file to upload' },
  ],

});