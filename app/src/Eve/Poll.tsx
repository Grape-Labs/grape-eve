import React, { useEffect, useState, useCallback, memo } from "react";

import CyberConnect, { Env, Blockchain, ConnectionType } from '@cyberlab/cyberconnect';

import { Connection, PublicKey, SystemProgram, Transaction, TransactionInstruction } from '@solana/web3.js';

import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import { FollowListInfoResp, SearchUserInfoResp, Network } from '../utils/cyberConnect/types';
import { followListInfoQuery, searchUserInfoQuery } from '../utils/cyberConnect/query';

import {
    Typography,
    Tooltip,
} from '@mui/material';

import MuiAlert, { AlertProps } from '@mui/material/Alert';

import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbUpBorderIcon from '@mui/icons-material/ThumbUpOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CircularProgress from '@mui/material/CircularProgress';

import "../App.less";

import { useConnection, useWallet } from '@solana/wallet-adapter-react';

export function SocialVotes(props: any){
    const [isVoted, setIsVoted] = React.useState(false);
    const [loadingVotedState, setLoadingVotedState] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [searchAddrInfo, setSearchAddrInfo] = useState<SearchUserInfoResp | null>(null);
    const [followListInfo, setFollowListInfo] = useState<FollowListInfoResp | null>(null);
    const {publicKey} = useWallet();
    const solanaProvider = useWallet();
    const address = props.address;
    
    const NAME_SPACE = 'Grape';
    const NETWORK = Network.SOLANA;
    const FIRST = 10; // The number of users in followings/followers list for each fetch

    const cyberConnect = new CyberConnect({
        namespace: NAME_SPACE,
        env: Env.PRODUCTION,
        chain: Blockchain.SOLANA,
        provider: solanaProvider,
        chainRef: "",//solana.SOLANA_MAINNET_CHAIN_REF,
        signingMessageEntity: 'Grape' || 'CyberConnect',
    });

    // Get the current user followings and followers list
    const initFollowListInfo = async () => {
        if (!address) {
            return;
    }
    
    setLoading(true);
    const resp = await followListInfoQuery({
        address:address,
        namespace: NAME_SPACE,
        network: NETWORK,
        followingFirst: FIRST,
        followerFirst: FIRST,
    });
    if (resp) {
      setFollowListInfo(resp);
    }
    setLoading(false);
  };

    const getLikeStatus = async () => {
        
        if (publicKey){
            if (address){
                setLoadingVotedState(true);
                setIsVoted(false);
                let socialconnection = await fetchSearchAddrInfo(publicKey.toBase58(), address);
                if (socialconnection){
                    //if (socialconnection?.identity){
                    if (socialconnection?.connections[0]?.followStatus) {  
                        if ((socialconnection?.connections[0].type.toString() === "VOTE")||
                            (socialconnection?.connections[0].type.toString() === "FOLLOW"))
                            setIsVoted(socialconnection?.connections[0].followStatus.isFollowing);
                    }
                }
                setLoadingVotedState(false);
            }
            
        }
    }

    const fetchSearchAddrInfo = async (fromAddr:string, toAddr: string) => {
        const resp = await searchUserInfoQuery({
            fromAddr:fromAddr,
            toAddr,
            namespace: NAME_SPACE,
            network: Network.SOLANA,
            type: 'LIKE',
        });
        if (resp) {
            setSearchAddrInfo(resp);
        }

        return resp;
    };

    const likeWalletConnect = async (followAddress:string) => {
        // address:string, alias:string
        let tofollow = followAddress;   
        let promise = await cyberConnect.connect(tofollow,'', ConnectionType.LIKE)
        .catch(function (error) {
            console.log(error);
        });
        initFollowListInfo();
        getLikeStatus();
    };
    const likeWalletDisconnect = async (followAddress:string) => {
        // address:string, alias:string
        let promise = await cyberConnect.disconnect(followAddress.toString())
        .catch(function (error) {
            console.log(error);
        });
        initFollowListInfo();
        getLikeStatus();
    };
    
    React.useEffect(() => {
        initFollowListInfo();
        getLikeStatus();
    },[]);

    return ( 
        <>
        {loadingVotedState ?
            <Button 
                sx={{borderRadius:'24px'}}
            >
                <CircularProgress sx={{p:'14px',m:-2}} />
            </Button>
        :
            <>
            {isVoted ?  
                    <Tooltip title="Remove Yai">
                        <Button 
                            variant="text" 
                            onClick={() => likeWalletDisconnect(address)}
                            size="small"
                            className="profileAvatarIcon"
                            sx={{borderRadius:'24px', color:'white'}}
                            >
                            <ThumbUpIcon sx={{fontSize:'24px', color:'red'}} /> 
                            {followListInfo?.voted && +followListInfo?.voted > 0 ?
                                <Typography variant="caption" sx={{ml:1}}>
                                    {followListInfo?.voted}
                                </Typography>
                            :<></>}
                        </Button>
                    </Tooltip>
                :
                    <Tooltip title="Yai">
                        <Button 
                            variant="text" 
                            onClick={() => likeWalletConnect(address)}
                            size="small"
                            className="profileAvatarIcon"
                            sx={{borderRadius:'24px', color:'white'}}
                            >
                            <ThumbUpBorderIcon sx={{fontSize:'24px'}} /> 
                            {followListInfo?.voted && +followListInfo?.voted > 0 ?
                                <Typography variant="caption" sx={{ml:1}}>
                                    {followListInfo?.voted}
                                </Typography>
                            :<></>}
                        </Button>
                    </Tooltip>
            }
            </>
        }
        </>
    );
}