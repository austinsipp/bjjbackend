'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Match extends Model {

    };
    Match.init({
        match_id: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
            autoIncrement: true
        },
        match_type: DataTypes.STRING,
        rule_set: DataTypes.STRING,
        left_player: {
            type: DataTypes.SMALLINT,
            references: {
                model: 'Player',
                key: 'player_id'
              }
        },
        right_player: {
            type: DataTypes.SMALLINT,
            references: {
                model: 'Player',
                key: 'player_id'
              }
        },
        date_of_match: DataTypes.DATE,
        match_desc: DataTypes.STRING,
        assoc_spec_event: DataTypes.STRING,
        created_by: DataTypes.STRING
    }, {
        sequelize,
        /*underscored: true,*//*removed this because I don't like it. 
        It takes camelcase values (js convention) here in js and changes 
        them in the database to underscored, which is the sql convention. 
        I'd rather have it just literally match the database and not have to 
        do a conversion and risk not matching*/
        timestamps: false,
        modelName: 'Match',
        freezeTableName: true
    });
    return Match;
};