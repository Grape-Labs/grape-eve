export type GrapeEve = {
  "version": "0.1.3",
  "name": "grape_eve",
  "instructions": [
    {
      "name": "createThread",
      "accounts": [
        {
          "name": "author",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "thread",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "community",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authorTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "CreateThreadArgs"
          }
        }
      ]
    },
    {
      "name": "updateThread",
      "accounts": [
        {
          "name": "author",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "thread",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "community",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authorTokenAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "UpdateThreadArgs"
          }
        }
      ]
    },
    {
      "name": "deleteThread",
      "accounts": [
        {
          "name": "author",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "thread",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "community",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authorTokenAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createCommunity",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "community",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "CreateCommunityArgs"
          }
        }
      ]
    },
    {
      "name": "editCommunity",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "community",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "EditCommunityArgs"
          }
        }
      ]
    },
    {
      "name": "deleteCommunity",
      "accounts": [
        {
          "name": "community",
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
      "name": "community",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "uuid",
            "type": "string"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "metadata",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "thread",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "author",
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "ends",
            "type": "u64"
          },
          {
            "name": "community",
            "type": "publicKey"
          },
          {
            "name": "reply",
            "type": "publicKey"
          },
          {
            "name": "threadType",
            "type": "u8"
          },
          {
            "name": "isEncrypted",
            "type": "bool"
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
          },
          {
            "name": "uuid",
            "type": "string"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CreateCommunityArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "metadata",
            "type": "string"
          },
          {
            "name": "uuid",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "EditCommunityArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "metadata",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "CreateThreadArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "replyTo",
            "type": "string"
          },
          {
            "name": "threadType",
            "type": "u8"
          },
          {
            "name": "isEncrypted",
            "type": "bool"
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
          },
          {
            "name": "ends",
            "type": "u64"
          },
          {
            "name": "uuid",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "UpdateThreadArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "replyTo",
            "type": "string"
          },
          {
            "name": "threadType",
            "type": "u8"
          },
          {
            "name": "isEncrypted",
            "type": "bool"
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
          },
          {
            "name": "ends",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "PublicKeyMismatch",
      "msg": "PublicKey Mismatch"
    },
    {
      "code": 6001,
      "name": "IncorrectOwner",
      "msg": "Incorrect Owner"
    },
    {
      "code": 6002,
      "name": "UninitializedAccount",
      "msg": "Uninitialized Account"
    },
    {
      "code": 6003,
      "name": "NumericalOverflow",
      "msg": "Numerical Overflow"
    },
    {
      "code": 6004,
      "name": "UnsureError",
      "msg": "Unsure Error"
    },
    {
      "code": 6005,
      "name": "TopicTooLong",
      "msg": "The provided topic should be 50 characters long maximum."
    },
    {
      "code": 6006,
      "name": "ContentTooLong",
      "msg": "The provided content should be 280 characters long maximum."
    },
    {
      "code": 6007,
      "name": "NotEnoughBalance",
      "msg": "You don't hold the needed mint token"
    },
    {
      "code": 6008,
      "name": "InvalidPubkeyProvided",
      "msg": "Invalid PubKey provided"
    }
  ]
};

export const IDL: GrapeEve = {
  "version": "0.1.3",
  "name": "grape_eve",
  "instructions": [
    {
      "name": "createThread",
      "accounts": [
        {
          "name": "author",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "thread",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "community",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authorTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "CreateThreadArgs"
          }
        }
      ]
    },
    {
      "name": "updateThread",
      "accounts": [
        {
          "name": "author",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "thread",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "community",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authorTokenAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "UpdateThreadArgs"
          }
        }
      ]
    },
    {
      "name": "deleteThread",
      "accounts": [
        {
          "name": "author",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "thread",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "community",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "authorTokenAccount",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createCommunity",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "community",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "CreateCommunityArgs"
          }
        }
      ]
    },
    {
      "name": "editCommunity",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "community",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": "EditCommunityArgs"
          }
        }
      ]
    },
    {
      "name": "deleteCommunity",
      "accounts": [
        {
          "name": "community",
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
      "name": "community",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "uuid",
            "type": "string"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "metadata",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "thread",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "author",
            "type": "publicKey"
          },
          {
            "name": "timestamp",
            "type": "u64"
          },
          {
            "name": "ends",
            "type": "u64"
          },
          {
            "name": "community",
            "type": "publicKey"
          },
          {
            "name": "reply",
            "type": "publicKey"
          },
          {
            "name": "threadType",
            "type": "u8"
          },
          {
            "name": "isEncrypted",
            "type": "bool"
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
          },
          {
            "name": "uuid",
            "type": "string"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "CreateCommunityArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "metadata",
            "type": "string"
          },
          {
            "name": "uuid",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "EditCommunityArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "metadata",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "CreateThreadArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "replyTo",
            "type": "string"
          },
          {
            "name": "threadType",
            "type": "u8"
          },
          {
            "name": "isEncrypted",
            "type": "bool"
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
          },
          {
            "name": "ends",
            "type": "u64"
          },
          {
            "name": "uuid",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "UpdateThreadArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "replyTo",
            "type": "string"
          },
          {
            "name": "threadType",
            "type": "u8"
          },
          {
            "name": "isEncrypted",
            "type": "bool"
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
          },
          {
            "name": "ends",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "PublicKeyMismatch",
      "msg": "PublicKey Mismatch"
    },
    {
      "code": 6001,
      "name": "IncorrectOwner",
      "msg": "Incorrect Owner"
    },
    {
      "code": 6002,
      "name": "UninitializedAccount",
      "msg": "Uninitialized Account"
    },
    {
      "code": 6003,
      "name": "NumericalOverflow",
      "msg": "Numerical Overflow"
    },
    {
      "code": 6004,
      "name": "UnsureError",
      "msg": "Unsure Error"
    },
    {
      "code": 6005,
      "name": "TopicTooLong",
      "msg": "The provided topic should be 50 characters long maximum."
    },
    {
      "code": 6006,
      "name": "ContentTooLong",
      "msg": "The provided content should be 280 characters long maximum."
    },
    {
      "code": 6007,
      "name": "NotEnoughBalance",
      "msg": "You don't hold the needed mint token"
    },
    {
      "code": 6008,
      "name": "InvalidPubkeyProvided",
      "msg": "Invalid PubKey provided"
    }
  ]
};
