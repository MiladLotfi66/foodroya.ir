
 async function AuthenticateUser() {
    try {
        const cookieStore = cookies();
      const accessToken = cookieStore.get("next-auth.session-token")?.value;
  
      if (!accessToken) {
        throw new Error("Access token not found");
      }
  
      const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/session`, {
        headers: {
          "Content-Type": "application/json",
          Cookie: `next-auth.session-token=${accessToken}`,
        },
        credentials: "include",
      });
  
      if (!res.ok) {
        throw new Error(`Failed to fetch user data. Status: ${res.status}`);
      }
  
      const session = await res.json();
  
      if (!session.user) {
        throw new Error("No user data found in session");
      }
  
      return session.user;
    } catch (error) {
      console.error("Error in authenticateUser:", error);
      return { error: error.message, status: 500 };
    }
  }

export default AuthenticateUser
