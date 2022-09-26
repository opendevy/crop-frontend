export type NftStaking = {
  "version": "0.1.0",
  "name": "nft_staking",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
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
          "name": "newAuthority",
          "type": "publicKey"
        },
        {
          "name": "nftCreator",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "initUserState",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userState",
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
          "name": "userKey",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "stakeNft",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftMetadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
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
          "name": "hashArr",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "nftType",
          "type": "u8"
        }
      ]
    },
    {
      "name": "unstakeNft",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
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
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "globalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "nftCreator",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "userState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "potionNfts",
            "type": {
              "array": [
                "publicKey",
                10
              ]
            }
          },
          {
            "name": "stakedTime",
            "type": {
              "array": [
                "u64",
                10
              ]
            }
          },
          {
            "name": "nftTypes",
            "type": {
              "array": [
                "u8",
                10
              ]
            }
          },
          {
            "name": "potionCounts",
            "type": {
              "array": [
                "u8",
                4
              ]
            }
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Unauthorized",
      "msg": "You are not authorized to perform this action."
    },
    {
      "code": 6001,
      "name": "NotAllowedAuthority",
      "msg": "You are not authorized to perform this action."
    },
    {
      "code": 6002,
      "name": "IncorrectMetadata",
      "msg": "Incorrect NFT Metadata"
    },
    {
      "code": 6003,
      "name": "IncorrectParameter",
      "msg": "Incorrect Parameter"
    },
    {
      "code": 6004,
      "name": "InvalidType",
      "msg": "Invalid NFT Type"
    },
    {
      "code": 6005,
      "name": "NftLocked",
      "msg": "NFT is still locked"
    },
    {
      "code": 6006,
      "name": "UnknownNFT",
      "msg": "Unknown NFT"
    },
    {
      "code": 6007,
      "name": "OverflowSameKindNft",
      "msg": "Overflow same kind NFT"
    },
    {
      "code": 6008,
      "name": "UnexpectedAction",
      "msg": "This action is not expected."
    }
  ]
};

export const IDL: NftStaking = {
  "version": "0.1.0",
  "name": "nft_staking",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
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
          "name": "newAuthority",
          "type": "publicKey"
        },
        {
          "name": "nftCreator",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "initUserState",
      "accounts": [
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userState",
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
          "name": "userKey",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "stakeNft",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "nftMetadata",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
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
          "name": "hashArr",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "nftType",
          "type": "u8"
        }
      ]
    },
    {
      "name": "unstakeNft",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userNftAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "nftMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
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
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "globalState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isInitialized",
            "type": "u8"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "nftCreator",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "userState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "potionNfts",
            "type": {
              "array": [
                "publicKey",
                10
              ]
            }
          },
          {
            "name": "stakedTime",
            "type": {
              "array": [
                "u64",
                10
              ]
            }
          },
          {
            "name": "nftTypes",
            "type": {
              "array": [
                "u8",
                10
              ]
            }
          },
          {
            "name": "potionCounts",
            "type": {
              "array": [
                "u8",
                4
              ]
            }
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Unauthorized",
      "msg": "You are not authorized to perform this action."
    },
    {
      "code": 6001,
      "name": "NotAllowedAuthority",
      "msg": "You are not authorized to perform this action."
    },
    {
      "code": 6002,
      "name": "IncorrectMetadata",
      "msg": "Incorrect NFT Metadata"
    },
    {
      "code": 6003,
      "name": "IncorrectParameter",
      "msg": "Incorrect Parameter"
    },
    {
      "code": 6004,
      "name": "InvalidType",
      "msg": "Invalid NFT Type"
    },
    {
      "code": 6005,
      "name": "NftLocked",
      "msg": "NFT is still locked"
    },
    {
      "code": 6006,
      "name": "UnknownNFT",
      "msg": "Unknown NFT"
    },
    {
      "code": 6007,
      "name": "OverflowSameKindNft",
      "msg": "Overflow same kind NFT"
    },
    {
      "code": 6008,
      "name": "UnexpectedAction",
      "msg": "This action is not expected."
    }
  ]
};
