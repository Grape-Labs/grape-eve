import { PublicKey, TokenAmount, Connection } from '@solana/web3.js';
import { ENV, TokenListProvider, TokenInfo } from '@solana/spl-token-registry';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import axios from "axios";

/*
import { 
    tryGetName,
} from '@cardinal/namespaces';
*/

import * as React from 'react';
import BN from 'bn.js';
import { styled, useTheme } from '@mui/material/styles';
import {
  Typography,
  Button,
  Grid,
  Box,
  Paper,
  Avatar,
  Skeleton,
  Table,
  TableContainer,
  TableCell,
  TableHead,
  TableBody,
  TableFooter,
  TableRow,
  TablePagination,
  Collapse,
  Tooltip,
  CircularProgress,
  LinearProgress,
} from '@mui/material/';

import { getProfilePicture } from '@solflare-wallet/pfp';
import { findDisplayName } from '../utils/name-service';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';

import { MakeLinkableAddress, ValidateAddress, ValidateCurve, trimAddress, timeAgo } from '../utils/grapeTools/WalletAddress'; // global key handling

import PropTypes from 'prop-types';
import { 
    GRAPE_RPC_ENDPOINT, 
    THEINDEX_RPC_ENDPOINT,
    TWITTER_PROXY } from '../utils/grapeTools/constants';

export const ConnectedIdentity = (props:any) => {
    const address = props.address;
    const avatarSize = props.avatarSize;
    const hidePubKey = props.hidePubKey || false;
    const [loadingpicture, setLoadingPicture] = React.useState(false);
    const [solanaDomain, setSolanaDomain] = React.useState(null);
    const [profilePictureUrl, setProfilePictureUrl] = React.useState(null);
    const [hasProfilePicture, setHasProfilePicture] = React.useState(false);
    const countRef = React.useRef(0);
    const ggoconnection = new Connection(GRAPE_RPC_ENDPOINT);
    
    const fetchProfilePicture = async () => {
        setLoadingPicture(true);  
            try{
                const { isAvailable, url } = await getProfilePicture(ggoconnection, new PublicKey(address));
                
                let img_url = url;
                if (url)
                    img_url = url.replace(/width=100/g, 'width=256');
                setProfilePictureUrl(img_url);
                setHasProfilePicture(isAvailable);
                countRef.current++;
            }catch(e){}
        setLoadingPicture(false);
    }

    const fetchSolanaDomain = async () => {
        
        
        console.log("fetching tryGetName: "+address);
        /*
        const cardinal_registration = await tryGetName(
            ggoconnection, 
            new PublicKey(address)
        );*/
        const cardinal_registration = null;

        if (cardinal_registration){
            //console.log("FOUND: "+JSON.stringify(cardinal_registration))
            setSolanaDomain(cardinal_registration);
            const url = `${TWITTER_PROXY}https://api.twitter.com/2/users/by&usernames=${cardinal_registration.slice(1)}&user.fields=profile_image_url,public_metrics`;
            /*
            const response = await window.fetch(url, {
                method: 'GET',
                headers: {
                }
            });
            */
            const response = await axios.get(url);
            //const twitterImage = response?.data?.data[0]?.profile_image_url;
            if (response?.data?.data[0]?.profile_image_url){
                setProfilePictureUrl(response?.data?.data[0]?.profile_image_url);
                setHasProfilePicture(true);
            }
        } else{
            const domain = await findDisplayName(ggoconnection, address);
            if (domain) {
                if (domain[0] !== address) {
                    setSolanaDomain(domain[0]);
                }
            }
        }
    };

    
    React.useEffect(() => {    
        if (!loadingpicture){
            //const interval = setTimeout(() => {
                if (address){
                    setSolanaDomain(null);
                    console.log("fetching identity for "+address)
                    fetchProfilePicture();
                    fetchSolanaDomain();
                }
            //}, 500);
        }
    }, [address]);
    
    if (loadingpicture){
        return (
            <Grid container direction="row">
                <Grid item>
                    <Avatar alt={address} sx={{ width: avatarSize, height: avatarSize, bgcolor: 'rgb(0, 0, 0)' }}>
                        <CircularProgress size="1rem" />
                    </Avatar>
                </Grid>
                {!hidePubKey &&
                <Grid item sx={{ml:1}}>
                    <Typography variant="h6" sx={{}}>{trimAddress(address,6)}</Typography>
                </Grid>
                }
            </Grid>
        )
    }else{
        if (hasProfilePicture){
            return (
                <Grid container direction="row">
                    <Grid item>
                        <Avatar alt={address} src={profilePictureUrl} sx={{ width: avatarSize, height: avatarSize, bgcolor: 'rgb(0, 0, 0)' }}>
                            {address.substr(0,2)}
                        </Avatar>
                    </Grid>
                    {!hidePubKey &&
                    <Grid item sx={{ml:1}}>
                        <Grid item sx={{textAlign:'left'}}>
                            {solanaDomain}
                        </Grid>
                        
                        <Grid item sx={{}}>
                            <Grid item sx={{textAlign:'left'}}>
                                <Typography variant="h6" sx={{}}>{trimAddress(address,6)}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    }
                </Grid>
            );
        
        } else{
            return (
                <>
                {jsNumberForAddress(address) ?
                    <Grid container direction="row">
                        <Grid item alignItems="center">
                            <Jazzicon diameter={avatarSize} seed={jsNumberForAddress(address)} />
                        </Grid>
                        {!hidePubKey &&
                        <Grid item sx={{ml:1}}>
                            <Grid item sx={{textAlign:'left'}}>
                                {solanaDomain}
                            </Grid>
                            
                            <Grid item sx={{}}>
                                <Grid item sx={{textAlign:'left'}}>
                                    <Typography variant="h6" sx={{}}>{trimAddress(address,6)}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        }
                    </Grid>
                :
                    <Grid container direction="row">
                        <Grid item alignItems="center">
                            <Jazzicon diameter={avatarSize} seed={Math.round(Math.random() * 10000000)} />
                        </Grid>
                        <Grid item sx={{ml:1}}>
                            <Grid item sx={{textAlign:'left'}}>
                                {solanaDomain}
                            </Grid>
                            
                            <Grid item sx={{}}>
                                <Grid item sx={{textAlign:'left'}}>
                                    <Typography variant="h6" sx={{}}>{trimAddress(address,6)}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                }
                </>
                
            );
        }
    }
}