FNM-WebServer
=============

A FluxNode Mixin to provide a wrapper around a node-static server

## Functions

The following functions are added to a FluxNode by this mixin

* FNMWebServer_startServer
* FNMWebServer_stopServer
* FNMWebServer_restartServer

## Emitted Events

The following events may be emitted by this mixin

* FNMWebServer.RequestReceived
* FNMWebServer.ResponseSent

## Listened Events

The following events are listened for by this mixin

* FNMWebServer.Start
* FNMWebServer.Stop
* FNMWebServer.Restart