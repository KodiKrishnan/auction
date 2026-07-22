package com.example.auth.repository;

import com.example.auth.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {

    List<Location> findByCountry(String country);

    List<Location> findByState(String state);

    List<Location> findByCityIgnoreCase(String city);

    Optional<Location> findByCountryIgnoreCaseAndStateIgnoreCaseAndCityIgnoreCaseAndLocalityIgnoreCase(
            String country, String state, String city, String locality);
}