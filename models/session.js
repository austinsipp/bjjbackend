'use strict';
const {  Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Session extends Model {

  };
  Session.init({
    session_id: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    expire_date: DataTypes.DATE,
    active_session: DataTypes.STRING
  }, {
    sequelize,
    /*underscored: true,*//*removed this because I don't like it. 
    It takes camelcase values (js convention) here in js and changes 
    them in the database to underscored, which is the sql convention. 
    I'd rather have it just literally match the database and not have to 
    do a conversion and risk not matching*/
    timestamps: false,
    modelName: 'Session',
  });
  return Session;
};