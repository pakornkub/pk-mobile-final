export const getDataFromQR = (qr: string): any => {
  try {

    //TODO: init Buffer for decode base64
    const Buffer = require('buffer').Buffer;

    //TODO: get data qr from url "http://119.59.105.14/toto-warranty/service?info={data base64}"
    let info = qr?.split('?info=')[1] ? ( Buffer.from(qr?.split('?info=')[1], 'base64')?.toString() || '' ) : qr;

    const qrObject = JSON.parse(info);

    return qrObject[0];
  } catch (error: any) {
    console.log(error);
    const err = {
      status: false,
      code: 'jsonError',
      message: 'Could not parse json',
      rawError: error,
    };

    return err;
  }
};
