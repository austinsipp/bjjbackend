'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Event extends Model {

    };
    Event.init({
        event_id: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
            autoIncrement: true
        },
        match_id: {
            type: DataTypes.SMALLINT,
            references: {
                model: 'Match',
                key: 'match_id'
              }
        },
        match_time: DataTypes.STRING,
        initiating_player: {
            type: DataTypes.SMALLINT,
            references: {
                model: 'Player',
                key: 'player_id'
              }
        },
        receiving_player: {
            type: DataTypes.SMALLINT,
            references: {
                model: 'Player',
                key: 'player_id'
              }
        },
        event_type: DataTypes.STRING,
        event_desc: DataTypes.STRING,
        points_awarded: DataTypes.SMALLINT,
        created_by: DataTypes.STRING,
        processed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false, // Default value set to false
            allowNull: false,    // Ensures this field cannot be NULL
          }
    }, {
        sequelize,
        /*underscored: true,*//*removed this because I don't like it. 
        It takes camelcase values (js convention) here in js and changes 
        them in the database to underscored, which is the sql convention. 
        I'd rather have it just literally match the database and not have to 
        do a conversion and risk not matching*/
        timestamps: false,
        modelName: 'Event',
        freezeTableName: true
    });
    return Event;
};