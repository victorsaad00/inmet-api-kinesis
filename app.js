'use strict';
const axios = require('axios');
const aws = require('aws-sdk');
const kinesis = new aws.Kinesis({region:'us-east-1'});

const filterNullValues = data => data == null ? 0 : data; 

module.exports.getData = async () => {

  try {
    const date = new Date();
    const current_day = `${date.getFullYear().toString()}-${(date.getMonth() + 1).toString()}-${date.getDate().toString()}`;
    const hour = date.getHours().toString();

    const url = `https://apitempo.inmet.gov.br/estacao/dados/${current_day}/${hour}00`;
    const response = await axios.get(url);
    const apiDataPE = response.data.filter(filterStation => filterStation.UF == "PE");
    

    let cleanData = apiDataPE.map(element => {
      return {
          Data: JSON.stringify({
            'CD_ESTACAO': element.CD_ESTACAO,
            'DC_NOME': element.DC_NOME,
            'UF': element.UF,
            'DT_MEDICAO': element.DT_MEDICAO,
            'HR_MEDICAO': element.HR_MEDICAO,
            'TEM_MAX': filterNullValues(element.TEM_MAX),
            'TEM_MIN': filterNullValues(element.TEM_MIN),
            'TEMP_INS': filterNullValues(element.TEMP_INS),
            'UMD_MIN': filterNullValues(element.UMD_MIN),
            'UMD_MAX': filterNullValues(element.UMD_MAX),
            'UMD_INS': filterNullValues(element.UMD_INS),
            'RAD_GLO': filterNullValues(element.RAD_GLO)
          }),
          PartitionKey:'1'
      };
    });

    await kinesis.putRecords({
      StreamName: 'inmet-entry-data-proj4',
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

          