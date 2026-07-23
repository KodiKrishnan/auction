DELIMITER $$

CREATE PROCEDURE usp_MapPropertyRule(
    IN p_property_id BIGINT,
    IN p_rule_id BIGINT,
    IN p_eff_from DATE,
    IN p_eff_to DATE
)
BEGIN

    DECLARE v_property_count INT DEFAULT 0;
    DECLARE v_rule_count INT DEFAULT 0;
    DECLARE v_checkin_day VARCHAR(20);
    DECLARE v_checkout_day VARCHAR(20);
    DECLARE v_rule_valid_from DATE;
    DECLARE v_rule_valid_to DATE;
    DECLARE v_existing_rule_id BIGINT;
    DECLARE v_existing_checkin VARCHAR(20);
    DECLARE v_existing_checkout VARCHAR(20);
    DECLARE v_current_date DATE;
    DECLARE v_stay_start DATE;
    DECLARE v_stay_end DATE;
    DECLARE v_existing_start DATE;
    DECLARE v_existing_end DATE;
    DECLARE v_existing_stay_start DATE;
    DECLARE v_existing_stay_end DATE;
    DECLARE v_existing_stay_start_reset DATE;
    DECLARE v_duration INT;
    DECLARE v_existing_duration INT;
    DECLARE v_day_diff INT;
    DECLARE v_existing_day_diff INT;
    DECLARE v_mapping_id BIGINT;
    DECLARE v_base_cost DECIMAL(38,2);
    DECLARE v_bid_increment DECIMAL(38,2);
    DECLARE v_bid_start_before INT;
    DECLARE v_bid_close_before INT;
    DECLARE v_owner_id BIGINT;
    DECLARE v_rule_owner_id BIGINT;
    DECLARE v_bid_open_datetime DATETIME;
    DECLARE v_bid_close_datetime DATETIME;
    DECLARE v_auction_status VARCHAR(20);
    DECLARE v_conflicting_rule_name VARCHAR(255);
    DECLARE v_conflicting_property_name VARCHAR(255);
    DECLARE v_error_msg VARCHAR(500);
    DECLARE done INT DEFAULT FALSE;

    DECLARE cur CURSOR FOR
    SELECT r.id, r.checkin_day, r.checkout_day, m.effective_from, m.effective_to
    FROM property_rule_mapping m
    JOIN rules r ON r.id = m.rule_id
    WHERE m.property_id = p_property_id
      AND m.status = 1
      AND p_eff_from <= m.effective_to
      AND p_eff_to >= m.effective_from;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- STEP 1: Validate date range
    IF p_eff_from > p_eff_to THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid date range';
    END IF;

    -- STEP 2: Validate property and get owner_id
    SELECT COUNT(*) INTO v_property_count FROM properties WHERE id = p_property_id;
    IF v_property_count = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Property not found';
    END IF;

    SELECT owner_id INTO v_owner_id FROM properties WHERE id = p_property_id;

    -- STEP 3: Validate rule
	SELECT COUNT(*)
	INTO v_rule_count
	FROM rules
	WHERE id = p_rule_id
	AND status = 1;

	IF v_rule_count = 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Rule not found or inactive';
	END IF;

	-- Get rule owner
	SELECT owner_id
	INTO v_rule_owner_id
	FROM rules
	WHERE id = p_rule_id;

	-- Validate that property and rule belong to the same owner
	IF v_owner_id <> v_rule_owner_id THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Property and Rule belong to different owners';
	END IF;

    -- STEP 4: Get rule details
    SELECT checkin_day, checkout_day, valid_from, valid_to,
           base_cost, bid_increment, bid_start_before, bid_close_before
    INTO v_checkin_day, v_checkout_day, v_rule_valid_from, v_rule_valid_to,
         v_base_cost, v_bid_increment, v_bid_start_before, v_bid_close_before
    FROM rules WHERE id = p_rule_id;

    -- STEP 5: Rule validity check
    IF p_eff_from < v_rule_valid_from OR p_eff_to > v_rule_valid_to THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Property rule mapping must be within rule validity';
    END IF;

    -- STEP 6: Calculate new rule duration
    SET v_day_diff =
        (CASE UPPER(v_checkout_day) WHEN 'SUNDAY' THEN 1 WHEN 'MONDAY' THEN 2 WHEN 'TUESDAY' THEN 3 WHEN 'WEDNESDAY' THEN 4 WHEN 'THURSDAY' THEN 5 WHEN 'FRIDAY' THEN 6 WHEN 'SATURDAY' THEN 7 END)
        -
        (CASE UPPER(v_checkin_day) WHEN 'SUNDAY' THEN 1 WHEN 'MONDAY' THEN 2 WHEN 'TUESDAY' THEN 3 WHEN 'WEDNESDAY' THEN 4 WHEN 'THURSDAY' THEN 5 WHEN 'FRIDAY' THEN 6 WHEN 'SATURDAY' THEN 7 END);

    IF v_day_diff <= 0 THEN SET v_day_diff = v_day_diff + 7; END IF;
    SET v_duration = v_day_diff;

    -- STEP 7: Check overlapping stays
    OPEN cur;

    read_loop: LOOP

        FETCH cur INTO v_existing_rule_id, v_existing_checkin, v_existing_checkout, v_existing_start, v_existing_end;

        IF done THEN LEAVE read_loop; END IF;

        SET v_existing_day_diff =
            (CASE UPPER(v_existing_checkout) WHEN 'SUNDAY' THEN 1 WHEN 'MONDAY' THEN 2 WHEN 'TUESDAY' THEN 3 WHEN 'WEDNESDAY' THEN 4 WHEN 'THURSDAY' THEN 5 WHEN 'FRIDAY' THEN 6 WHEN 'SATURDAY' THEN 7 END)
            -
            (CASE UPPER(v_existing_checkin) WHEN 'SUNDAY' THEN 1 WHEN 'MONDAY' THEN 2 WHEN 'TUESDAY' THEN 3 WHEN 'WEDNESDAY' THEN 4 WHEN 'THURSDAY' THEN 5 WHEN 'FRIDAY' THEN 6 WHEN 'SATURDAY' THEN 7 END);

        IF v_existing_day_diff <= 0 THEN SET v_existing_day_diff = v_existing_day_diff + 7; END IF;
        SET v_existing_duration = v_existing_day_diff;

        SET v_existing_stay_start_reset = DATE(v_existing_start);
        WHILE UPPER(DAYNAME(v_existing_stay_start_reset)) <> UPPER(v_existing_checkin) DO
            SET v_existing_stay_start_reset = DATE_ADD(v_existing_stay_start_reset, INTERVAL 1 DAY);
        END WHILE;

        SET v_current_date = p_eff_from;

        WHILE v_current_date <= p_eff_to DO

            IF UPPER(DAYNAME(v_current_date)) = UPPER(v_checkin_day) THEN

                SET v_stay_start = v_current_date;
                SET v_stay_end = DATE_ADD(v_stay_start, INTERVAL v_duration DAY);

                SET v_existing_stay_start = v_existing_stay_start_reset;

                WHILE v_existing_stay_start <= DATE(v_existing_end) DO

                    SET v_existing_stay_end = DATE_ADD(v_existing_stay_start, INTERVAL v_existing_duration DAY);

                    IF v_stay_start < v_existing_stay_end AND v_stay_end > v_existing_stay_start THEN

                        SELECT rule_name INTO v_conflicting_rule_name
                        FROM rules WHERE id = v_existing_rule_id;

                        SELECT property_name INTO v_conflicting_property_name
                        FROM properties WHERE id = p_property_id;

                        SET v_error_msg = CONCAT(
                            'Overlapping stay period detected for property "', v_conflicting_property_name,
                            '" with rule "', v_conflicting_rule_name,
                            '" from ', v_existing_stay_start, ' to ', v_existing_stay_end
                        );

                        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_msg;

                    END IF;

                    SET v_existing_stay_start = DATE_ADD(v_existing_stay_start, INTERVAL 7 DAY);

                END WHILE;

            END IF;

            SET v_current_date = DATE_ADD(v_current_date, INTERVAL 1 DAY);

        END WHILE;

    END LOOP;

    CLOSE cur;

    -- STEP 8: Insert mapping
    INSERT INTO property_rule_mapping (property_id, rule_id, effective_from, effective_to, status, created_at)
    VALUES (p_property_id, p_rule_id, p_eff_from, p_eff_to, 1, NOW());

    SET v_mapping_id = LAST_INSERT_ID();

    -- STEP 9: Generate auctions
    SET v_current_date = p_eff_from;

    WHILE v_current_date <= p_eff_to DO

        IF UPPER(DAYNAME(v_current_date)) = UPPER(v_checkin_day) THEN

            SET v_stay_start = v_current_date;
            SET v_stay_end = DATE_ADD(v_stay_start, INTERVAL v_duration DAY);

            IF v_stay_end <= p_eff_to THEN

                -- Calculate bid open and close datetimes
                SET v_bid_open_datetime = TIMESTAMP(
                    DATE_SUB(v_stay_start, INTERVAL v_bid_start_before DAY),
                    '10:00:00'
                );

                SET v_bid_close_datetime = TIMESTAMP(
                    DATE_SUB(v_stay_start, INTERVAL v_bid_close_before DAY),
                    '10:00:00'
                );

                -- Determine auction status based on bid open date
                SET v_auction_status = CASE
                    WHEN v_bid_open_datetime > NOW() THEN 'UPCOMING'
                    ELSE 'OPEN'
                END;

                INSERT INTO auction (
                    property_id,
                    rule_id,
                    mapping_id,
                    owner_id,
                    stay_start_date,
                    stay_end_date,
                    bid_open_date,
                    bid_close_date,
                    base_cost,
                    bid_increment,
                    auction_status,
                    created_at
                )
                VALUES (
                    p_property_id,
                    p_rule_id,
                    v_mapping_id,
                    v_owner_id,
                    v_stay_start,
                    v_stay_end,
                    v_bid_open_datetime,
                    v_bid_close_datetime,
                    v_base_cost,
                    v_bid_increment,
                    v_auction_status,
                    NOW()
                );

            END IF;

        END IF;

        SET v_current_date = DATE_ADD(v_current_date, INTERVAL 1 DAY);

    END WHILE;	

END$$

DELIMITER ;