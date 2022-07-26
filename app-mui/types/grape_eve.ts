export type GrapeEve = {
  "version": "0.1.0",
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
          "name": "community",
          "type": "string"
        },
        {
          "name": "communityType",
          "type": "i8"
        },
        {
          "name": "isEncrypted",
          "type": "i8"
        },
        {
          "name": "metadata",
          "type": "string"
        },
        {
          "name": "reply",
          "type": "string"
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
            "name": "topic",
            "type": "string"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "community",
            "type": "string"
          },
          {
            "name": "communityType",
            "type": "i8"
          },
          {
            "name": "metadata",
            "type": "string"
          },
          {
            "name": "isEncrypted",
            "type": "i8"
          },
          {
            "name": "reply",
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
  "version": "0.1.0",
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
          "name": "community",
          "type": "string"
        },
        {
          "name": "communityType",
          "type": "i8"
        },
        {
          "name": "isEncrypted",
          "type": "i8"
        },
        {
          "name": "metadata",
          "type": "string"
        },
        {
          "name": "reply",
          "type": "string"
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
            "name": "topic",
            "type": "string"
          },
          {
            "name": "content",
            "type": "string"
          },
          {
            "name": "community",
            "type": "string"
          },
          {
            "name": "communityType",
            "type": "i8"
          },
          {
            "name": "metadata",
            "type": "string"
          },
          {
            "name": "isEncrypted",
            "type": "i8"
          },
          {
            "name": "reply",
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
