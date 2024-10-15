import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  IconButton,
  Button,
  Typography,
  ButtonGroup,
} from '@mui/joy';
import { CheckIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NewChatForm({ submitChat, defaultChats = [] }) {
  const [chats, setChats] = useState([
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'human', content: 'Hello' },
    { role: 'assistant', content: 'Hi there!' },
  ]);

  const [nextChat, setNextChat] = useState({ role: 'human', content: '' });

  function systemMessageValue() {
    return chats.find((chat) => chat.role === 'system')?.content;
  }

  function editSystemMessageValue(value) {
    const newChats = [...chats];
    const systemMessageIndex = newChats.findIndex(
      (chat) => chat.role === 'system'
    );
    newChats[systemMessageIndex].content = value;
    setChats(newChats);
  }

  useEffect(() => {
    if (defaultChats.length > 0) {
      setChats(defaultChats);
    }
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflowY: 'auto',
        maxHeight: '50vh',
        padding: 2,
        minWidth: '50vw',
      }}
    >
      <FormControl>
        <FormLabel>System Message</FormLabel>
        <Input
          value={systemMessageValue()}
          onChange={(event) => editSystemMessageValue(event.target.value)}
        />
      </FormControl>
      {chats.map((chat, index) => (
        <SingleLineOfChat
          key={index}
          index={index}
          chat={chat}
          chats={chats}
          setChats={setChats}
        />
      ))}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          alignItems: 'center',
        }}
      >
        <Select
          value={nextChat.role}
          sx={{ minWidth: '120px' }}
          variant="soft"
          onChange={(event, newValue) => {
            setNextChat({ role: newValue, content: nextChat.content });
          }}
        >
          <Option value="human">Human</Option>
          <Option value="assistant">Assistant</Option>
        </Select>
        <Input
          sx={{ flex: 1 }}
          placeholder="Type a message..."
          value={nextChat.content}
          onChange={(event) =>
            setNextChat({ role: nextChat.role, content: event.target.value })
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setChats([...chats, nextChat]);
              setNextChat({
                role: nextChat?.role == 'human' ? 'assistant' : 'human',
                content: '',
              });
            }
          }}
        />{' '}
        <IconButton
          variant="plain"
          color="success"
          onClick={(event) => {
            setChats([...chats, nextChat]);
            setNextChat({
              role: nextChat?.role == 'human' ? 'assistant' : 'human',
              content: '',
            });
          }}
        >
          <CheckIcon />
        </IconButton>
      </Box>
      <Button sx={{ mt: 3 }} onClick={() => submitChat(chats)}>
        Save
      </Button>
    </Box>
  );
}

function SingleLineOfChat({ index, chat, chats, setChats }) {
  const [isEditing, setIsEditing] = useState(false);

  // Don't display the system message
  if (chat?.role === 'system') {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        alignItems: 'center',
      }}
    >
      {isEditing ? (
        <Select
          value={chat.role}
          sx={{ minWidth: '120px' }}
          variant="soft"
          onChange={(event, newValue) => {
            const newChats = [...chats];
            newChats[index].role = newValue;
            setChats(newChats);
          }}
        >
          <Option value="human">Human</Option>
          <Option value="assistant">Assistant</Option>
        </Select>
      ) : (
        <Typography
          color={chat.role === 'human' ? 'primary' : 'primary'}
          sx={{ minWidth: '120px' }}
        >
          {chat.role === 'human' ? 'Human:' : 'Assistant:'}
        </Typography>
      )}{' '}
      {isEditing ? (
        <Input
          sx={{ flex: 1 }}
          value={chat.content}
          onChange={(event) => {
            const newChats = [...chats];
            newChats[index].content = event.target.value;
            setChats(newChats);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setIsEditing(false);
            }
          }}
          endDecorator={}
        />
      ) : (
        <Typography sx={{ flex: 1 }}>{chat.content}</Typography>
      )}
      <ButtonGroup>
        {isEditing ? (
          <IconButton
            variant="outlined"
            color="success"
            onClick={() => setIsEditing(false)}
          >
            <CheckIcon />
          </IconButton>
        ) : (
          <IconButton
            variant="outlined"
            color="primary"
            onClick={() => setIsEditing(true)}
          >
            <PencilIcon size="18px" />
          </IconButton>
        )}
        <IconButton
          variant="outlined"
          color="danger"
          onClick={() => {
            const newChats = [...chats];
            newChats.splice(index, 1);
            setChats(newChats);
          }}
        >
          <Trash2Icon size="18px" />
        </IconButton>
      </ButtonGroup>
    </Box>
  );
}
