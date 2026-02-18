import { useAuth } from "@/hooks/use-auth";
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, useAnnouncements, useCreateAnnouncement } from "@/hooks/use-data";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Megaphone, Users, Plus, Trash2, Edit, Shield } from "lucide-react";
import { useState } from "react";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (!user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  return (
    <div className="container py-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-secondary rounded-lg text-white shadow-lg">
          <Shield className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your kingdom's subjects and decrees</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 border">
          <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" /> Users & Roles</TabsTrigger>
          <TabsTrigger value="announcements" className="gap-2"><Megaphone className="h-4 w-4" /> Announcements</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="announcements">
          <AnnouncementManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserManagement() {
  const { data: users, isLoading } = useUsers();
  const deleteUser = useDeleteUser();
  
  if (isLoading) return <div>Loading users...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Directory</CardTitle>
          <CardDescription>Manage user roles, tags, and special statuses</CardDescription>
        </div>
        <CreateUserDialog />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Employee of Month</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className="font-medium">{u.username}</div>
                  <div className="text-xs text-muted-foreground">{u.displayName}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'moderator' ? 'default' : 'secondary'}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {u.tag ? (
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.tagColor ? '' : 'bg-muted'}`} style={u.tagColor ? { color: u.tagColor } : {}}>
                      {u.tag}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {u.isEmployeeOfMonth ? (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Winner</Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right flex items-center justify-end gap-2">
                  <EditUserDialog user={u} />
                  <Button variant="ghost" size="icon" onClick={() => {
                    if (confirm("Are you sure? This cannot be undone.")) {
                      deleteUser.mutate(u.id);
                    }
                  }}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const createUser = useCreateUser();
  const [formData, setFormData] = useState({ username: "", password: "", role: "user" as const });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(formData, { onSuccess: () => setOpen(false) });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2"><Plus className="h-4 w-4" /> Add User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create New User</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={formData.role} onValueChange={(v: any) => setFormData({...formData, role: v})}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={createUser.isPending}>Create User</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const updateUser = useUpdateUser();
  const [formData, setFormData] = useState({
    displayName: user.displayName || "",
    role: user.role,
    tag: user.tag || "",
    tagColor: user.tagColor || "",
    isEmployeeOfMonth: user.isEmployeeOfMonth
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser.mutate({ id: user.id, ...formData }, { onSuccess: () => setOpen(false) });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit User: {user.username}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Display Name (Animated)</Label>
            <Input value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.role} onValueChange={(v: any) => setFormData({...formData, role: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="moderator">Moderator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tag (e.g. VIP)</Label>
              <Input value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value})} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Tag Color (Hex or Tailwind class)</Label>
            <Input value={formData.tagColor} onChange={e => setFormData({...formData, tagColor: e.target.value})} placeholder="#FF0000" />
          </div>
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <Label>Employee of the Month</Label>
            <Switch 
              checked={formData.isEmployeeOfMonth}
              onCheckedChange={c => setFormData({...formData, isEmployeeOfMonth: c})}
            />
          </div>
          <Button type="submit" className="w-full" disabled={updateUser.isPending}>Save Changes</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AnnouncementManagement() {
  const { data: announcements } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const [content, setContent] = useState("");

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    createAnnouncement.mutate({ content, active: true }, { onSuccess: () => setContent("") });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Announcement</CardTitle>
          <CardDescription>This will appear in the scrolling marquee at the top</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePublish} className="flex gap-4">
            <Input 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              placeholder="Enter announcement text..." 
              required
            />
            <Button type="submit" disabled={createAnnouncement.isPending}>Publish</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements?.map((a) => (
              <div key={a.id} className="p-4 border rounded-lg flex justify-between items-center">
                <p className={a.active ? "font-bold text-primary" : "text-muted-foreground"}>{a.content}</p>
                <Badge variant={a.active ? "default" : "outline"}>{a.active ? "Active" : "Archived"}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
