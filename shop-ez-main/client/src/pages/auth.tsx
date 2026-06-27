import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useLogin, useRegister, useUser } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required").optional().or(z.literal('')),
});

export default function Auth() {
  const [, setLocation] = useLocation();
  const { data: user } = useUser();
  const login = useLogin();
  const register = useRegister();
  
  // If already logged in, redirect to home
  useEffect(() => {
    if (user) setLocation("/");
  }, [user, setLocation]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", name: "", email: "" },
  });

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-muted/30 py-12 px-4 sm:px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex bg-primary p-2.5 rounded-xl mb-4 shadow-lg shadow-primary/20">
            <ShoppingBag className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold text-foreground">Welcome to ShopEZ</h2>
          <p className="text-muted-foreground mt-2">Sign in or create an account to continue.</p>
        </div>

        <div className="bg-white border rounded-3xl shadow-xl overflow-hidden">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="w-full grid grid-cols-2 h-14 rounded-none bg-muted/50 p-0 border-b">
              <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none text-base h-full border-b-2 border-transparent data-[state=active]:border-primary">
                Log In
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-white data-[state=active]:shadow-none rounded-none text-base h-full border-b-2 border-transparent data-[state=active]:border-primary">
                Sign Up
              </TabsTrigger>
            </TabsList>
            
            <div className="p-6 sm:p-8">
              <TabsContent value="login" className="mt-0">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit((data) => login.mutate(data))} className="space-y-4">
                    <FormField control={loginForm.control} name="username" render={({ field }) => (
                      <FormItem>
                        <Label>Username</Label>
                        <FormControl><Input {...field} className="h-12 rounded-xl bg-muted/50" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={loginForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <Label>Password</Label>
                        <FormControl><Input type="password" {...field} className="h-12 rounded-xl bg-muted/50" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full rounded-xl h-12 text-base font-semibold mt-6" disabled={login.isPending}>
                      {login.isPending ? "Logging in..." : "Log In"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit((data) => register.mutate(data))} className="space-y-4">
                    <FormField control={registerForm.control} name="name" render={({ field }) => (
                      <FormItem>
                        <Label>Full Name</Label>
                        <FormControl><Input {...field} className="h-11 rounded-xl bg-muted/50" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={registerForm.control} name="email" render={({ field }) => (
                      <FormItem>
                        <Label>Email (Optional)</Label>
                        <FormControl><Input type="email" {...field} className="h-11 rounded-xl bg-muted/50" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={registerForm.control} name="username" render={({ field }) => (
                      <FormItem>
                        <Label>Username</Label>
                        <FormControl><Input {...field} className="h-11 rounded-xl bg-muted/50" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={registerForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <Label>Password</Label>
                        <FormControl><Input type="password" {...field} className="h-11 rounded-xl bg-muted/50" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full rounded-xl h-12 text-base font-semibold mt-6" disabled={register.isPending}>
                      {register.isPending ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
