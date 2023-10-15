// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var auth_pb = require('./auth_pb.js');

function serialize_auth_AccessTokenRequest(arg) {
  if (!(arg instanceof auth_pb.AccessTokenRequest)) {
    throw new Error('Expected argument of type auth.AccessTokenRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_AccessTokenRequest(buffer_arg) {
  return auth_pb.AccessTokenRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_auth_AccessTokenResponse(arg) {
  if (!(arg instanceof auth_pb.AccessTokenResponse)) {
    throw new Error('Expected argument of type auth.AccessTokenResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_auth_AccessTokenResponse(buffer_arg) {
  return auth_pb.AccessTokenResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var AuthServiceService = exports.AuthServiceService = {
  isAccessTokenValid: {
    path: '/auth.AuthService/isAccessTokenValid',
    requestStream: false,
    responseStream: false,
    requestType: auth_pb.AccessTokenRequest,
    responseType: auth_pb.AccessTokenResponse,
    requestSerialize: serialize_auth_AccessTokenRequest,
    requestDeserialize: deserialize_auth_AccessTokenRequest,
    responseSerialize: serialize_auth_AccessTokenResponse,
    responseDeserialize: deserialize_auth_AccessTokenResponse,
  },
};

exports.AuthServiceClient = grpc.makeGenericClientConstructor(AuthServiceService);
