'use strict';
const axios = require('axios');
const aws = require('aws-sdk');
const kinesis = new aws.Kinesis({region:'us-east-1'});

const filterNullValues = data => data == null ? 0 : data; 

module.exports.getData = async (event) => {
  try {
    const date = new Date(); 
    const current_date = `${date.getFullYear().toString()}-${(date.getMonth() + 1).toString()}-${date.getDate().toString()}`
    let hour = date.getUTCHours().toString()
    hour = hour.length < 2 ? ("0" + hour + "00") : (hour + "00");

    const url = `https://apitempo.inmet.gov.br/estacao/dados/${current_date}/${hour}`;
    const response = await axios.get(url);
    const apiDataPE = response.data.filter(filterStation => filterStation.UF == "PE");
    
    let cleanData = apiDataPE.map(element => {
      return {
          Data: JSON.stringify({
            'CD_ESTACAO': element.CD_ESTACAO,
            'DC_NOME': element.DC_NOME,
            'UF': element.UF,
            'LATITUDE': element.VL_LATITUDE,
            'LONGITUDE': element.VL_LONGITUDE,
            'DT_MEDICAO': element.DT_MEDICAO,
            'HR_MEDICAO': element.HR_MEDICAO,
            'TEM_MAX': filterNullValues(element.TEM_MAX),
            'TEMP_INS': filterNullValues(element.TEMP_INS),
            'UMD_MIN': filterNullValues(element.UMD_MIN),
            'UMD_INS': filterNullValues(element.UMD_INS),
            'RAD_GLO': filterNullValues(element.RAD_GLO)
          }),
          PartitionKey:'1'
      };
    });

    await kinesis.putRecords({
      StreamName: 'inmet-stream-data-proj4',
      Records: cleanData,
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(cleanData)
    }

  } catch (error) {
    return {
      statusCode : 500,
      body: JSON.stringify(error)
    };
  }
};

          