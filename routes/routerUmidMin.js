const AWS = require('aws-sdk');

const S3 = new AWS.S3();

// DATA type 2
module.exports.umidMin = async () => {
  try {
    const bucket_data = await S3.getObject({
      Bucket: process.env.bucket,
      Key: 'bucket-data/b_data.json',
    }).promise();

    let result_data = JSON.parse(bucket_data.Body.toString('utf-8')).map(Element => {
        return {
          "CODIGO_ESTACAO": Element.CD_ESTACAO,
          "NOME_ESTACAO": Element.DC_NOME,
          "LATITUDE": Element.LATITUDE,
          "LONGITUDE": Element.LONGITUDE,
          "HORA_COLETA": Element.HR_MEDICAO,
          "UMD_MIN": Element.UMD_MIN
        }
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(result_data),
    };

  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      message: JSON.stringify(error),
    };
  }
};