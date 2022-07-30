export type GrapeEve = {
  "version": "0.1.2",
  "name": "grape_eve",
  "instructions": [
    {
      "name": "sendPost",
      "accounts": [
        {
          "name": "thread",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "author",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "topic",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        },
        {
          "name": "metadata",
          "type": "string"
        },
        {
          "name": "threadType",
          "type": "i8"
        },
        {
          "name": "isEncrypted",
          "type": "i8"
        },
        {
          "name": "community",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "reply",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "updatePost",
      "accounts": [
        {
          "name": "thread",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "author",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "topic",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "deletePost",
      "accounts": [
        {
          "name": "thread",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "author",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "thread",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "community",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "reply",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "threadType",
            "type": "i8"
          },
          {
            "name": "isEncrypted",
            "type": "i8"
          },
          {
            "name": "topic",
            "type": "string"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "metadata",
            "type": "string"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ErrorCode",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "TopicTooLong"
          },
          {
            "name": "ContentTooLong"
          }
        ]
      }
    }
  ]
};

export const IDL: GrapeEve = {
  "version": "0.1.2",
  "name": "grape_eve",
  "instructions": [
    {
      "name": "sendPost",
      "accounts": [
        {
          "name": "thread",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "author",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "topic",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        },
        {
          "name": "metadata",
          "type": "string"
        },
        {
          "name": "threadType",
          "type": "i8"
        },
        {
          "name": "isEncrypted",
          "type": "i8"
        },
        {
          "name": "community",
          "type": {
            "option": "publicKey"
          }
        },
        {
          "name": "reply",
          "type": {
            "option": "publicKey"
          }
        }
      ]
    },
    {
      "name": "updatePost",
      "accounts": [
        {
          "name": "thread",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "author",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "topic",
          "type": "string"
        },
        {
          "name": "content",
          "type": "string"
        }
      ]
    },
    {
      "name": "deletePost",
      "accounts": [
        {
          "name": "thread",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "author",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "thread",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "author",
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "community",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "reply",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "threadType",
            "type": "i8"
          },
          {
            "name": "isEncrypted",
            "type": "i8"
          },
          {
            "name": "topic",
            "type": "string"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "metadata",
            "type": "string"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "ErrorCode",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "TopicTooLong"
          },
          {
            "name": "ContentTooLong"
          }
        ]
      }
    }
  ]
};
