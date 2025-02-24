'use strict';
const {  Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class School extends Model {

  };
  School.init({
    school_id: {
      type: DataTypes.SMALLINT,
      primaryKey: true,
      autoIncrement: true
    },
    school_name: DataTypes.STRING,
    school_name_ext: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING
  }, {
    sequelize,
    /*underscored: true,*//*removed this because I don't like it. 
    It takes camelcase values (js convention) here in js and changes 
    them in the database to underscored, which is the sql convention. 
    I'd rather have it just literally match the database and not have to 
    do a conversion and risk not matching*/
    timestamps: false,
    modelName: 'School',
  });
  return School;
};