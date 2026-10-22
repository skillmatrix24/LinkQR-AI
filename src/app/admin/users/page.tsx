
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, doc, Timestamp, serverTimestamp } from "firebase/firestore";
import { Loader2, Mail, Calendar, ShieldCheck, Search, User as UserIcon, Clock, Sparkles, Edit2 } from "lucide-react";
import { format, addDays, isValid } from "date-fns";
import { useToast } from "@/hooks/use-toast";

/**
 * Utility to safely parse Firestore Timestamps or strings into Dates.
 */
function parseFirestoreDate(dateValue: any): Date | null {
  if (!dateValue) return null;
  if (dateValue.toDate) return dateValue.toDate();
  if (dateValue instanceof Date) return dateValue;
  const d = new Date(dateValue);
  return isValid(d) ? d : null;
}

export default function UsersManagement() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsPlanEditDialogOpen] = useState(false);
  const [newPlanId, setNewPlanId] = useState("");
  const [newExpiryDays, setNewExpiryDays] = useState("30");
  const [isSaving, setIsSaving] = useState(false);

  // Master user registry query
  const usersRef = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), orderBy("createdAt", "desc"));
  }, [db]);
  const { data: users, isLoading } = useCollection(usersRef);

  // Active tiers query for the management dialog
  const plansRef = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "plans");
  }, [db]);
  const { data: plans } = useCollection(plansRef);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user => 
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  const stats = useMemo(() => {
    if (!users) return { total: 0, paid: 0, free: 0, qrs: 0 };
    return {
      total: users.length,
      paid: users.filter(u => u.currentPlanId !== 'free_plan' && u.currentPlanId).length,
      free: users.filter(u => u.currentPlanId === 'free_plan' || !u.currentPlanId).length,
      qrs: users.reduce((acc, u) => acc + (u.qrCodeCount || 0), 0)
    };
  }, [users]);

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setNewPlanId(user.currentPlanId || "free_plan");
    setIsPlanEditDialogOpen(true);
  };

  const handleUpdatePlan = async () => {
    if (!selectedUser || !db) return;
    
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", selectedUser.id);
      const newExpiry = addDays(new Date(), parseInt(newExpiryDays));
      
      updateDocumentNonBlocking(userRef, {
        currentPlanId: newPlanId,
        planExpiryDate: Timestamp.fromDate(newExpiry),
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Plan Updated",
        description: `Successfully moved ${selectedUser.displayName} to ${newPlanId.replace('_', ' ').toUpperCase()}.`,
      });
      setIsPlanEditDialogOpen(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: err.message
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
        <p className="text-muted-foreground font-medium">Loading user directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Directory</h1>
          <p className="text-muted-foreground">Monitor registrations, manage plans, and platform growth.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm"><CardContent className="p-6"><p className="text-sm font-medium text-muted-foreground">Total Users</p><p className="text-3xl font-bold mt-2">{stats.total}</p></CardContent></Card>
        <Card className="border-none shadow-sm"><CardContent className="p-6"><p className="text-sm font-medium text-muted-foreground">Paid Subscribers</p><p className="text-3xl font-bold mt-2 text-primary">{stats.paid}</p></CardContent></Card>
        <Card className="border-none shadow-sm"><CardContent className="p-6"><p className="text-sm font-medium text-muted-foreground">Free Users</p><p className="text-3xl font-bold mt-2 text-orange-600">{stats.free}</p></CardContent></Card>
        <Card className="border-none shadow-sm"><CardContent className="p-6"><p className="text-sm font-medium text-muted-foreground">Total QR Codes</p><p className="text-3xl font-bold mt-2">{stats.qrs}</p></CardContent></Card>
      </div>

      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-50/50">
                <TableRow>
                  <TableHead className="w-[280px]">User Details</TableHead>
                  <TableHead>Current Plan</TableHead>
                  <TableHead>QR Usage</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                  const expiryDate = parseFirestoreDate(user.planExpiryDate);
                  const joinDate = parseFirestoreDate(user.createdAt);

                  return (
                    <TableRow key={user.id} className="group hover:bg-neutral-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><UserIcon className="h-4 w-4" /></div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm truncate flex items-center gap-2">{user.displayName || "User"}{user.isAdmin && <ShieldCheck className="h-3.5 w-3.5 text-red-500" />}</span>
                            <span className="text-xs text-muted-foreground truncate flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.currentPlanId === 'free_plan' || !user.currentPlanId ? 'outline' : 'default'} className="uppercase text-[10px] tracking-wider px-2 py-0.5">
                          {user.currentPlanId?.replace('_', ' ') || 'Free'}
                        </Badge>
                      </TableCell>
                      <TableCell><div className="flex flex-col"><span className="font-bold text-sm">{user.qrCodeCount || 0} QRs</span></div></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs">
                          {user.isAdmin ? <div className="flex items-center gap-1 font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Lifetime</div> : (
                            <><Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="font-medium">
                                {expiryDate ? format(expiryDate, 'MMM dd, yyyy') : "No Date"}
                              </span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {joinDate ? format(joinDate, 'MMM dd, yyyy') : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity gap-2 font-bold text-xs" onClick={() => handleOpenEdit(user)}><Edit2 className="h-3.5 w-3.5" /> Manage</Button>
                      </TableCell>
                    </TableRow>
                  );
                }) : <TableRow><TableCell colSpan={6} className="text-center py-12">No users found.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsPlanEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
            <DialogDescription>Modify plan tier and expiry duration for this user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Assigned Plan</Label>
              <Select value={newPlanId} onValueChange={setNewPlanId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {plans?.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Access Duration (Days)</Label>
              <Select value={newExpiryDays} onValueChange={setNewExpiryDays}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="365">1 Year</SelectItem>
                  <SelectItem value="3650">10 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPlanEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdatePlan} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

