package com.example.auth.dto;

import lombok.Data;

@Data
public class AuctionCountResponse {
    private long total;
    private long open;
    private long closed;
    private long cancelled;

    public AuctionCountResponse(long total, long open, long closed, long cancelled) {
        this.total = total;
        this.open = open;
        this.closed = closed;
        this.cancelled = cancelled;
    }
}