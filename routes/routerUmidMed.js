const AWS = require('aws-sdk');

const S3 = new AWS.S3();

// DATA Type 1
module.exports.umidMed = async () => {
  try {

    const bucket_data = await S3.getObject({
      Bucket: process.env.bucket,
      Key: 'bucket-data/b_data.json',
    }).promise();

    let result_data = JSON.parse(bucket_data.Body.toString('utf-8')).map(Element => {
        return {
          "VALOR_OBSERVADO": Element.UMD_MIN
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