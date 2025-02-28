import {
  Box,
  Button,
  Divider,
  Dropdown,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  ListItemDecorator,
  Menu,
  MenuButton,
  MenuItem,
  Sheet,
  Typography,
} from '@mui/joy';

import '@xyflow/react/dist/style.css';
import {
  AxeIcon,
  BookOpenIcon,
  EllipsisIcon,
  PenIcon,
  PlayIcon,
  PlusCircleIcon,
  Trash2Icon,
  WorkflowIcon,
} from 'lucide-react';
import { useState } from 'react';

import * as chatAPI from '../../../lib/transformerlab-api-sdk';
import useSWR from 'swr';
import NewWorkflowModal from './NewWorkflowModal';
import NewNodeModal from './NewNodeModal';
import WorkflowCanvas from './WorkflowCanvas';

function ShowCode({ code }) {
  const config = code?.config;

  if (!config) {
    return <></>;
  }

  let parsedConfig = {};

  try {
    parsedConfig = JSON.parse(config);
  } catch (e) {}

  return (
    <Box
      sx={{ width: '100%', backgroundColor: '#F7F9FB', overflow: 'scroll' }}
      p={4}
    >
      <pre>{JSON.stringify(parsedConfig, null, 2)}</pre>
    </Box>
  );
}

const fetcher = (url: any) => fetch(url).then((res) => res.json());

export default function Workflows({ experimentInfo }) {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState(null);
  const [newWorkflowModalOpen, setNewWorkflowModalOpen] = useState(false);
  const [newNodeflowModalOpen, setNewNodeflowModalOpen] = useState(false);
  const [viewCodeMode, setViewCodeMode] = useState(false);

  const {
    data: workflowsData,
    error: workflowsError,
    isLoading: isLoading,
    mutate: mutateWorkflows,
  } = useSWR(chatAPI.Endpoints.Workflows.List(), fetcher);

  const workflows = workflowsData;

  const selectedWorkflow = workflows?.find(
    (workflow) => workflow.id === selectedWorkflowId
  );

  async function runWorkflow(workflowId: string) {
    await fetch(chatAPI.Endpoints.Workflows.RunWorkflow(workflowId));
  }

  return (
    <Sheet
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        mb: 3,
      }}
    >
      <NewWorkflowModal
        open={newWorkflowModalOpen}
        onClose={() => {
          setNewWorkflowModalOpen(false);
          mutateWorkflows();
        }}
        experimentId={experimentInfo?.id}
      />
      {selectedWorkflow && (
        <NewNodeModal
          open={newNodeflowModalOpen}
          onClose={() => {
            setNewNodeflowModalOpen(false);
            mutateWorkflows();
          }}
          selectedWorkflow={selectedWorkflow}
          experimentInfo={experimentInfo}
        />
      )}
      <Typography level="h1" mb={1}>
        Workflows
      </Typography>
      <Sheet
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          width: '100%',
          height: '100%',
        }}
      >
        <Box flex={1}>
          <Typography level="title-lg" mb={2}>
            Workflows
          </Typography>
          <List>
            {workflows &&
              workflows?.length > 0 &&
              workflows?.map((workflow) => (
                <ListItem key={workflow.id}>
                  <ListItemButton
                    onClick={() => setSelectedWorkflowId(workflow.id)}
                    selected={selectedWorkflowId === workflow.id}
                  >
                    <ListItemDecorator>
                      <WorkflowIcon />
                    </ListItemDecorator>
                    <ListItemContent>{workflow.name}</ListItemContent>
                  </ListItemButton>
                </ListItem>
              ))}
            <Divider />
            <ListItem>
              <ListItemButton onClick={() => setNewWorkflowModalOpen(true)}>
                <ListItemDecorator>
                  <PlusCircleIcon />
                </ListItemDecorator>
                <ListItemContent>New Workflow</ListItemContent>
              </ListItemButton>
            </ListItem>
          </List>
        </Box>

        <Box flex={3} display="flex" flexDirection="column">
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            mb={1}
            justifyContent="space-between"
          >
            <Typography level="title-lg">
              Workflow {selectedWorkflow?.name}
            </Typography>
            <Box pl={2} display="flex" flexDirection="row" gap={1}>
              <>
                <Button
                  variant="plain"
                  disabled={!selectedWorkflow}
                  // startDecorator={<BookOpenIcon />}
                  onClick={() => setViewCodeMode(!viewCodeMode)}
                >
                  {viewCodeMode ? 'View Graph' : 'View Code'}
                </Button>
                {selectedWorkflow?.status != 'RUNNING' ? (
                  <Button
                    disabled={!selectedWorkflow}
                    startDecorator={<PlayIcon />}
                    onClick={() => runWorkflow(selectedWorkflow.id)}
                  >
                    Run
                  </Button>
                ) : (
                  <Button startDecorator={<PlayIcon />} disabled>
                    Running
                  </Button>
                )}
                <Dropdown>
                  <MenuButton variant="plain" disabled={!selectedWorkflow}>
                    <EllipsisIcon />
                  </MenuButton>
                  <Menu>
                    <MenuItem onClick={() => alert('not implemented')}>
                      <ListItemDecorator>
                        <PenIcon />
                      </ListItemDecorator>
                      Edit Workflow Name
                    </MenuItem>
                    <MenuItem
                      color="danger"
                      onClick={async () => {
                        if (
                          confirm(
                            'Are you sure you want to delete workflow ' +
                              selectedWorkflow?.name +
                              '?'
                          )
                        ) {
                          await fetch(
                            chatAPI.Endpoints.Workflows.DeleteWorkflow(
                              selectedWorkflow?.id
                            )
                          );
                          mutateWorkflows();
                          setSelectedWorkflowId(null);
                        }
                      }}
                    >
                      <ListItemDecorator>
                        <Trash2Icon />
                      </ListItemDecorator>
                      Delete Workflow
                    </MenuItem>
                  </Menu>
                </Dropdown>
              </>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              flexDirection: 'row',
            }}
          >
            {selectedWorkflow ? (
              viewCodeMode ? (
                <ShowCode code={selectedWorkflow} />
              ) : (
                <WorkflowCanvas
                  selectedWorkflow={selectedWorkflow}
                  setNewNodeModalOpen={setNewNodeflowModalOpen}
                  mutateWorkflows={mutateWorkflows}
                />
              )
            ) : (
              <Box sx={{ width: '100%', backgroundColor: '#F7F9FB' }} p={4}>
                Select Workflow
              </Box>
            )}
          </Box>
        </Box>
      </Sheet>
    </Sheet>
  );
}
