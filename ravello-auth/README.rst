.. raw:: html

   <!--
   Copyright 2016-2017 F5 Networks Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
   -->

F5 Agility Training Portal - Ravello Authentication Microservice 
=========================================================

|travis build|

This microservice authenticates a user against their Oracle Ravello Cloud Identity Domain and returns
a JSON Web Token (JWT) for authorization in the Agility Training Portal. 


Introduction
------------

This microservice requires the following environment variables:

In Production:
 - JWT_SECRET - Secret used to create the JSON Web Token
 - EXPIRESIN - When the token Expires
 - ISSUER - Who's issuing the token
 - AUDIENCE - Who is the token for

In Development - for the testing:
 - USERNAME - dummy username
 - PASSWORD - dummy password
 - DOMAIN - dummy identity domain

License
-------

Apache V2.0
~~~~~~~~~~~

Licensed under the Apache License, Version 2.0 (the "License"); you may
not use this file except in compliance with the License. You may obtain
a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

Contributor License Agreement
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Individuals or business entities who contribute to this project must
have completed and submitted the `F5 Contributor License
Agreement <https://github.com/F5Networks/f5-application-services-integration-iApp/raw/release/v2.0.002/docs/_static/F5-contributor-license-agreement.pdf>`_
to cla@f5.com prior to their code submission being included
in this project.

.. |travis build| image:: https://travis-ci.org/codygreen/Agility-Training-Portal.svg?branch=master
    :target: https://travis-ci.org/codygreen/Agility-Training-Portal