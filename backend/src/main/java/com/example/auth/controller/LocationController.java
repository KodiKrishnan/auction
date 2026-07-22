package com.example.auth.controller;

import com.example.auth.entity.Location;
import com.example.auth.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/master")
public class LocationController {

    @Autowired
    private LocationService service;

    @GetMapping("/locations")
    public ResponseEntity<?> getLocations(
        @RequestParam(required = false) String country,
        @RequestParam(required = false) String state,
        @RequestParam(required = false) String city
    ) {
        List<Location> list;

        if (city != null && !city.isEmpty()) {
            list = service.getByCity(city);        // returns localities under that city
        } else if (state != null && !state.isEmpty()) {
            list = service.getByState(state);
        } else if (country != null && !country.isEmpty()) {
            list = service.getByCountry(country);
        } else {
            list = service.getAll();
        }

        return ResponseEntity.ok(Map.of(
            "status", "SUCCESS",
            "data", list
        ));
    }
}