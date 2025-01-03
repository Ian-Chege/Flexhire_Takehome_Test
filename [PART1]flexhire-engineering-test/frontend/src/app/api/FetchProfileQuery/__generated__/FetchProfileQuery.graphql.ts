/**
 * @generated SignedSource<<494edbe1ad918665f63480377fadd631>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type FetchProfileQuery$variables = Record<PropertyKey, never>;
export type FetchProfileQuery$data = {
  readonly currentUser: {
    readonly avatarUrl: string | null | undefined;
    readonly name: string | null | undefined;
  } | null | undefined;
};
export type FetchProfileQuery = {
  response: FetchProfileQuery$data;
  variables: FetchProfileQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "avatarUrl",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "FetchProfileQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "currentUser",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "FetchProfileQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "currentUser",
        "plural": false,
        "selections": [
          (v0/*: any*/),
          (v1/*: any*/),
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3ccb085252bdcf2619cfd73020b0e9c7",
    "id": null,
    "metadata": {},
    "name": "FetchProfileQuery",
    "operationKind": "query",
    "text": "query FetchProfileQuery {\n  currentUser {\n    name\n    avatarUrl\n    id\n  }\n}\n"
  }
};
})();

(node as any).hash = "1020a4dd3cb06c2a31c11c23d8c9da36";

export default node;
