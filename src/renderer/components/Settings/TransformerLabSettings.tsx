import * as React from 'react';

import Sheet from '@mui/joy/Sheet';
import {
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Input,
  Select,
  Option,
  Table,
  Typography,
  Alert,
  Tabs,
  TabList,
  Tab,
  TabPanel,
} from '@mui/joy';

import * as chatAPI from 'renderer/lib/transformerlab-api-sdk';
import useSWR from 'swr';
import { EyeIcon, EyeOffIcon, RotateCcwIcon } from 'lucide-react';

// Import the AIProvidersSettings component.
import AIProvidersSettings from './AIProvidersSettings';
import ViewJobsTab from './ViewJobsTab';

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function TransformerLabSettings() {
  const [showPassword, setShowPassword] = React.useState(false);
  const {
    data: hftoken,
    error: hftokenerror,
    isLoading: hftokenisloading,
    mutate: hftokenmutate,
  } = useSWR(
    chatAPI.Endpoints.Config.Get('HuggingfaceUserAccessToken'),
    fetcher,
  );
  const [showJobsOfType, setShowJobsOfType] = React.useState('NONE');
  const [showProvidersPage, setShowProvidersPage] = React.useState(false);

  const {
    data: jobs,
    error: jobsError,
    isLoading: jobsIsLoading,
    mutate: jobsMutate,
  } = useSWR(chatAPI.Endpoints.Jobs.GetJobsOfType(showJobsOfType, ''), fetcher);

  const {
    data: canLogInToHuggingFace,
    error: canLogInToHuggingFaceError,
    isLoading: canLogInToHuggingFaceIsLoading,
    mutate: canLogInToHuggingFaceMutate,
  } = useSWR(chatAPI.Endpoints.Models.HuggingFaceLogin(), fetcher);

  const {
    data: wandbLoginStatus,
    error: wandbLoginStatusError,
    isLoading: wandbLoginStatusIsLoading,
    mutate: wandbLoginMutate,
  } = useSWR(chatAPI.Endpoints.Models.testWandbLogin(), fetcher);

  if (showProvidersPage) {
    return (
      <AIProvidersSettings
        onBack={() => {
          setShowProvidersPage(false);
        }}
      />
    );
  }

  return (
    <>
      <Typography level="h1" marginBottom={1}>
        Transformer Lab Settings
      </Typography>
      <Sheet sx={{ width: '100%', overflowY: 'auto' }}>
        <Tabs defaultValue={0}>
          <TabList>
            <Tab>Settings</Tab>
            <Tab>View Jobs</Tab>
          </TabList>
          <TabPanel value={0}>
            {canLogInToHuggingFaceIsLoading && <CircularProgress />}
            <Typography level="title-lg" marginBottom={2}>
              Huggingface Credentials:
            </Typography>
            {canLogInToHuggingFace?.message === 'OK' ? (
              <Alert color="success">Login to Huggingface Successful</Alert>
            ) : (
              <>
                <Alert color="danger" sx={{ mb: 1 }}>
                  Login to Huggingface Failed. Please set credentials below.
                </Alert>
                <FormControl sx={{ maxWidth: '500px' }}>
                  <FormLabel>User Access Token</FormLabel>
                  {hftokenisloading ? (
                    <CircularProgress />
                  ) : (
                    <Input
                      name="hftoken"
                      defaultValue={hftoken}
                      type="password"
                      endDecorator={
                        <IconButton
                          onClick={() => {
                            const x = document.getElementsByName('hftoken')[0];
                            x.type = x.type === 'text' ? 'password' : 'text';
                            setShowPassword(!showPassword);
                          }}
                        >
                          {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                        </IconButton>
                      }
                    />
                  )}
                  <Button
                    onClick={async () => {
                      const token =
                        document.getElementsByName('hftoken')[0].value;
                      await fetch(
                        chatAPI.Endpoints.Config.Set(
                          'HuggingfaceUserAccessToken',
                          token,
                        ),
                      );
                      // Now manually log in to Huggingface
                      await fetch(chatAPI.Endpoints.Models.HuggingFaceLogin());
                      hftokenmutate(token);
                      canLogInToHuggingFaceMutate();
                    }}
                    sx={{ marginTop: 1, width: '100px', alignSelf: 'flex-end' }}
                  >
                    Save
                  </Button>
                  <FormHelperText>
                    A Huggingface access token is required in order to access
                    certain models and datasets (those marked as "Gated").
                  </FormHelperText>
                  <FormHelperText>
                    Documentation here:{' '}
                    <a
                      href="https://huggingface.co/docs/hub/security-tokens"
                      target="_blank"
                      rel="noreferrer"
                    >
                      https://huggingface.co/docs/hub/security-tokens
                    </a>
                  </FormHelperText>
                </FormControl>
              </>
            )}
            {wandbLoginStatus?.message === 'OK' ? (
              <Alert color="success">
                Login to Weights &amp; Biases Successful
              </Alert>
            ) : (
              <FormControl sx={{ maxWidth: '500px', mt: 2 }}>
                <FormLabel>Weights &amp; Biases API Key</FormLabel>
                <Input name="wandbToken" type="password" />
                <Button
                  onClick={async () => {
                    const token =
                      document.getElementsByName('wandbToken')[0].value;
                    await fetch(
                      chatAPI.Endpoints.Config.Set('WANDB_API_KEY', token),
                    );
                    await fetch(chatAPI.Endpoints.Models.wandbLogin());
                    wandbLoginMutate();
                  }}
                  sx={{ marginTop: 1, width: '100px', alignSelf: 'flex-end' }}
                >
                  Save
                </Button>
              </FormControl>
            )}
            <Divider sx={{ mt: 2, mb: 2 }} />
            <Typography level="title-lg" marginBottom={2}>
              AI Providers & Models:
            </Typography>
            {/* Clickable list option */}
            <Button variant="soft" onClick={() => setShowProvidersPage(true)}>
              Set API Keys for AI Providers
            </Button>

            <Divider sx={{ mt: 2, mb: 2 }} />
            <Typography level="title-lg" marginBottom={2}>
              Application:
            </Typography>
            <Button
              variant="soft"
              onClick={() => {
                // find and delete all items in local storage that begin with oneTimePopup:
                for (const key in localStorage) {
                  if (key.startsWith('oneTimePopup')) {
                    localStorage.removeItem(key);
                  }
                }
              }}
            >
              Reset all Tutorial Popup Screens
            </Button>
          </TabPanel>
          <TabPanel value={1}>
            <ViewJobsTab />
          </TabPanel>
        </Tabs>
      </Sheet>
    </>
  );
}
