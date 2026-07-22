package com.example.auth.service;

import com.example.auth.entity.Location;
import com.example.auth.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LocationService {

    @Autowired
    private LocationRepository repository;

    public List<Location> getAll() {
        return repository.findAll();
    }

    public List<Location> getByCountry(String country) {
        return repository.findByCountry(country);
    }

    public List<Location> getByState(String state) {
        return repository.findByState(state);
    }

    public List<Location> getByCity(String city) {
        return repository.findByCityIgnoreCase(city);
    }

    public Long getOrCreateLocationId(
            String country,
            String state,
            String city,
            String locality
    ) {
        country = country.trim();
        state = state.trim();
        city = city.trim();
        locality = (locality != null) ? locality.trim() : "";

        Optional<Location> existing =
        repository.findByCountryIgnoreCaseAndStateIgnoreCaseAndCityIgnoreCaseAndLocalityIgnoreCase(
                country,
                state,
                city,
                locality
        );

        if (existing.isPresent()) {
            return existing.get().getId();
        }

        Location newLocation = new Location();
        newLocation.setCountry(country);
        newLocation.setState(state);
        newLocation.setCity(city);
        newLocation.setLocality(locality);

        return repository.save(newLocation).getId();
    }
}