'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // SQL to create the view
    await queryInterface.sequelize.query(`
      -- View: public.stats_view

-- DROP VIEW public.stats_view;

CREATE OR REPLACE VIEW public.stats_view
 AS
 WITH ordered_events AS (
         SELECT event_id,
            match_id,
            match_time,
            initiating_player,
            receiving_player,
            event_type,
            event_desc,
            points_awarded,
            created_by,
            processed,
            row_number() OVER (ORDER BY 2::integer, 3::integer) AS rownumber
           FROM public."Event"
          WHERE processed = false AND (event_type::text <> ALL (ARRAY['pause'::character varying::text, 'start match'::character varying::text, 'victory'::character varying::text]))
          ORDER BY match_id, match_time
        ), 
		event_w_duration AS (
         SELECT t1.event_id,
            t1.match_id,
            t1.match_time,
            t1.initiating_player,
            t1.receiving_player,
            t1.event_type,
            t1.event_desc,
            t1.points_awarded,
            t1.created_by,
            t1.processed,
            t1.rownumber,
            TRIM(BOTH FROM t2.match_time)::double precision AS end_time,
            TRIM(BOTH FROM t1.match_time)::double precision AS start_time,
                CASE
                    WHEN t1.event_type::text ~~ '%position%'::text THEN TRIM(BOTH FROM t2.match_time)::double precision - TRIM(BOTH FROM t1.match_time)::double precision
                    ELSE 0::double precision
                END AS duration
           FROM ordered_events t1
             LEFT JOIN ordered_events t2 ON t1.match_id = t2.match_id AND t1.rownumber = (t2.rownumber - 1)
        )
 SELECT t1.initiating_player AS player_id,
    t2.player_name,
    t2.player_school,
    t2.player_belt,
    t1.match_id,
    t3.match_type,
    t3.date_of_match,
    t3.match_desc,
    t3.assoc_spec_event,
    t1.event_id,
    'attacker'::text AS position_type,
    t1.event_desc AS position_desc,
    t1.duration,
    t1.receiving_player AS opponent_id,
    t4.player_name AS opponent_name,
    t4.player_school AS opponent_school,
    t4.player_belt AS opponent_belt,
    t1.created_by
   FROM event_w_duration t1
     LEFT JOIN "Player" t2 ON t1.initiating_player = t2.player_id
     LEFT JOIN "Match" t3 ON t1.match_id = t3.match_id
     LEFT JOIN "Player" t4 ON t1.receiving_player = t4.player_id
UNION ALL
 SELECT t1.receiving_player AS player_id,
    t2.player_name,
    t2.player_school,
    t2.player_belt,
    t1.match_id,
    t3.match_type,
    t3.date_of_match,
    t3.match_desc,
    t3.assoc_spec_event,
    t1.event_id,
    'defender'::text AS position_type,
    t1.event_desc AS position_desc,
    t1.duration,
    t1.initiating_player AS opponent_id,
    t4.player_name AS opponent_name,
    t4.player_school AS opponent_school,
    t4.player_belt AS opponent_belt,
    t1.created_by
   FROM event_w_duration t1
     LEFT JOIN "Player" t2 ON t1.receiving_player = t2.player_id
     LEFT JOIN "Match" t3 ON t1.match_id = t3.match_id
     LEFT JOIN "Player" t4 ON t1.initiating_player = t4.player_id
  ORDER BY 10;
    `);
  },

  async down (queryInterface, Sequelize) {
    // SQL to drop the view if rolling back the migration
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS public.stats_view');
  }
};
