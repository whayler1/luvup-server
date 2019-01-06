let isSendEmailResolve = true;

export default {
  sendEmail: jest.fn(
    () => (isSendEmailResolve ? Promise.resolve() : Promise.reject()),
  ),
  __setIsSendEmailResolve: newIsSendEmailResolve =>
    (isSendEmailResolve = newIsSendEmailResolve),
};
