import React, { useEffect, useCallback, useRef } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
//import { ShdwDrive } from "@shadow-drive/sdk";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, Connection, PublicKey } from '@solana/web3.js';
import { Schema, deserializeUnchecked, deserialize } from "borsh";
import { TokenAmount } from '../utils/grapeTools/safe-math';
//import idl from '../../idl/grape_eve.json';
import { GrapeEve, IDL } from "../../../target/types/grape_eve"

import { Thread } from '../models'

import { 
    Provider, Program, web3 
} from '@project-serum/anchor'

import { useSnackbar } from 'notistack';
import { WalletError } from '@solana/wallet-adapter-base';
import { WalletConnectButton } from "@solana/wallet-adapter-material-ui";

import { useTranslation } from 'react-i18next';

import moment from 'moment';

import { 
    GRAPE_RPC_ENDPOINT
} from '../utils/grapeTools/constants';

import { styled } from '@mui/material/styles';
import {
    Box,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemAvatar,
    ListItemButton,
    Avatar,
    Tooltip,
    Typography,
    Collapse,
    ListSubheader,
    Button,
    ButtonGroup,
    Divider,
    Dialog,
    DialogActions,
    DialogTitle,
    DialogContent,
    TextField,
    FormControl,
    FormControlLabel,
    FormLabel,
    Select,
    MenuItem,
    InputLabel,
    Paper,
    Container,
    Radio,
    RadioGroup,
    LinearProgress
} from '@mui/material';

import GrapeIcon from "../components/static/GrapeIcon";
import SolanaIcon from "../components/static/SolIcon";
import SolCurrencyIcon from '../components/static/SolCurrencyIcon';

import { buffer } from "node:stream/consumers";

const Input = styled('input')({
    display: 'none',
});

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuDialogContent-root': {
      padding: theme.spacing(2),
    },
    '& .MuDialogActions-root': {
      padding: theme.spacing(1),
    },
  }));

function isImage(url:string) {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
}

let workspace = null

export const useWorkspace = () => workspace
  
export function EveView(props: any){
	const geconnection = new Connection(GRAPE_RPC_ENDPOINT);
    //const { connection } = useConnection();
	const wallet = useWallet();
    const [loading, setLoading] = React.useState(false);

    const {handlekey} = useParams<{ handlekey: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const urlParams = searchParams.get("storage") || searchParams.get("address") || handlekey;
    const [threads, setThreads] = React.useState(null);

    const { enqueueSnackbar, closeSnackbar } = useSnackbar();

    const onError = useCallback(
        (error: WalletError) => {
            enqueueSnackbar(error.message ? `${error.name}: ${error.message}` : error.name, { variant: 'error' });
            console.error(error);
        },
        [enqueueSnackbar]
    );

    //export const  initWorkspace = () => {
    async function initWorkspace() {  
        const clusterUrl = 'https://api.devnet.solana.com'; //'https://ssc-dao.genesysgo.net/';//process.env.VUE_APP_CLUSTER_URL
        const grapeEveId = "GXaZPJ3kwoZKMMxBxnRnwG87EJKBu7GjT8ks8dR4p693";
        const programID = new PublicKey(grapeEveId);
        
        const connection = new Connection(clusterUrl)

        async function getProvider() {
            /* create the provider and return it to the caller */
            /* network set to local network for now */
            const connection = new Connection(clusterUrl);
            
            //const provider = new AnchorProvider(
            const provider = new Provider(
                    connection, wallet, {
                commitment: "processed"
            },
            );
            return provider;
        }

        const provider = await getProvider()
        const program = new Program<GrapeEve>(IDL, programID, provider);

        workspace = {
            wallet,
            connection,
            provider,
            program,
        }
    }

    const fetchThreads = async (filters = []) => {
        await initWorkspace();
        const { program } = await useWorkspace()

        const thread = await program.account.thread.all(filters);

        //console.log("t: "+JSON.stringify(thread));
        //return thread;
        return thread.map((thread:any) => new Thread(thread.publicKey, thread.account))
    }

    useEffect(() => {
		(async () => {
            //if (urlParams){
                //console.log("PARAMS: "+urlParams);

                setLoading(true);
                
                const thrds = await fetchThreads(null);
                setThreads(thrds);
                console.log("threads: "+JSON.stringify(thrds))
                setLoading(false);

            /*
            } else if (wallet?.publicKey) {
                setLoading(true);
                // do some magic here...
                setLoading(false);
			}*/

		})();
	}, [])
	
    return (
        <>
            <Box
                sx={{ 
                    p: 1, 
                    mt: 6,
                    mb: 3, 
                    width: '100%',
                    background: '#13151C',
                    borderRadius: '24px'
                }}
            > 
                <Grid 
                    container 
                    direction="column" 
                    spacing={2} 
                    alignItems="center"
                    justifyContent={'center'}
                    rowSpacing={8}
                >
                    
                    <Grid 
                        item sm={12}
                        alignItems="center"
                    >

                        {loading ?
                            <>
                                Loading...
                                <LinearProgress />
                            </>
                        :
                            <>
                                {threads &&
                                    <>
                                        <Typography>{threads.length} thread posts</Typography>
                                        <List sx={{ width: '100%' }}>
                                        
                                        {threads?.map((item:any) => {
                                            <>{JSON.stringify(item.author)}</>
                                        })}

                                        {threads.map((item:any) => {
                                            <ListItem alignItems="flex-start">
                                                <ListItemAvatar>
                                                    <Avatar>
                                                        {item?.author}
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={item?.topic}
                                                    secondary={
                                                        <React.Fragment>
                                                        <Typography
                                                            sx={{ display: 'inline' }}
                                                            component="span"
                                                            variant="body2"
                                                            color="text.primary"
                                                        >
                                                            {item?.timestamp}
                                                        </Typography>
                                                        {item?.content}
                                                        </React.Fragment>
                                                    }
                                                />
                                            </ListItem>
                                        
                                        })}
                                        </List>
                                    </>
                                }
                            </>
                        }
                    </Grid>
                </Grid>
            </Box>
        </>
	)
}