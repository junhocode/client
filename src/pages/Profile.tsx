import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useUserStore from '@/stores/userStore';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { username, avatar_url, setUser } = useUserStore(); // setUser로 유저 상태 업데이트
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedUsername, setEditedUsername] = useState(username);
  const [editedAvatarUrl, setEditedAvatarUrl] = useState(avatar_url);
  const [selectedTechStack, setSelectedTechStack] = useState<string[]>([]);
  const navigate = useNavigate();

  const handleSaveProfile = () => {
    setUser({ username: editedUsername, avatar_url: editedAvatarUrl }); // 유저 상태 업데이트
    setIsEditMode(false);
  };

  const handleTechStackChange = (value: string) => {
    setSelectedTechStack((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value) // 이미 선택된 경우 제거
        : [...prev, value] // 선택되지 않은 경우 추가
    );
  };

  const handlePost = () => {
    navigate("/newpost")
  }

  return (
    <div>
      <div className="w-screen p-8 absolute top-36">
        <Card className="pt-20 h-[400px]">
          <CardHeader className="text-center">
            <CardTitle className="text-5xl mb-6">Welcome back, {username}!</CardTitle>
            <CardDescription>This is your Developer Profile of DevMate.</CardDescription>
            <CardContent className="items-center">
              <Button className="w-[300px] h-[60px] text-xl font-semibold mr-6 mt-6 bg-blue-500 hover:bg-blue-600" onClick={handlePost}>
                Create New Post
              </Button>
              <Button className="w-[300px] h-[60px] text-xl font-semibold bg-green-500 hover:bg-green-600">
                Search Posts
              </Button>
            </CardContent>
          </CardHeader>
        </Card>
      </div>

      <div className="w-screen flex p-8 absolute">
        <Card className="w-1/2 flex-col h-[400px] mr-4">
          <CardContent className="flex flex-col items-center justify-center h-full">
            {isEditMode ? (
              <>
                <Input
                  value={editedAvatarUrl}
                  onChange={(e) => setEditedAvatarUrl(e.target.value)}
                  placeholder="Avatar URL"
                  className="mb-4"
                />
                <Input
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  placeholder="Username"
                  className="mb-4"
                />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Select Your Tech Stack</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <ToggleGroup
                      type="multiple"
                      value={selectedTechStack}
                      onValueChange={handleTechStackChange}
                      variant="outline"
                    >
                      <ToggleGroupItem value="react">React</ToggleGroupItem>
                      <ToggleGroupItem value="java">Java</ToggleGroupItem>
                      <ToggleGroupItem value="python">Python</ToggleGroupItem>
                      <ToggleGroupItem value="typescript">TypeScript</ToggleGroupItem>
                    </ToggleGroup>
                  </DialogContent>
                </Dialog>
                <div className="flex flex-wrap mt-4 gap-2">
                  {selectedTechStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-blue-200 text-blue-800 rounded-lg"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <Button className="bg-green-500 text-white mt-4" onClick={handleSaveProfile}>
                  Save Profile
                </Button>
                <Button
                  className="bg-gray-500 text-white mt-2"
                  onClick={() => setIsEditMode(false)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <div
                  className="avatar rounded-full w-24 h-24 bg-cover bg-center mb-6"
                  style={{ backgroundImage: `url(${avatar_url})` }}
                ></div>
                <div className="text-lg font-semibold mb-4">{username}</div>
                <div className="text-sm text-gray-500 mb-6">Junior Frontend Developer</div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedTechStack.length > 0 ? (
                    selectedTechStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-blue-200 text-blue-800 rounded-lg"
                      >
                        {tech}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No Tech Stack Selected</p>
                  )}
                </div>
                <Button
                  className="top-2 left-2 bg-blue-500 text-white"
                  onClick={() => setIsEditMode(true)}
                >
                  Edit Profile
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>About Me</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              className="h-[230px]"
              placeholder="Please Introduce yourself to other Developers in DevMate!"
            />
          </CardContent>
          <CardFooter>
            <Button>Save!</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
