"use client";

import { useEffect } from "react";

import { useOpenChatSessionStore } from "@/lib/ai/mirael-core/v2/open-chat-session.store";
import { createClient } from "@/lib/supabase/client";

const AuthListener: React.FC = () => {
  const supabase = createClient();
  useEffect(() => {
    console.log("Auth listener mounted");

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") {
        // handle initial session
      } else if (event === "SIGNED_IN") {
        // handle sign in event
      } else if (event === "SIGNED_OUT") {
        // if (getSessionKey()) {
        //   clearSessionKey();
        // }
        useOpenChatSessionStore.persist.clearStorage();

        // handle sign out event
      } else if (event === "PASSWORD_RECOVERY") {
        // handle password recovery event
      } else if (event === "TOKEN_REFRESHED") {
        // handle token refreshed event
      } else if (event === "USER_UPDATED") {
        // handle user updated event
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);
  //   useEffect(() => {
  //     const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
  //       console.log("Auth event:", event, session);
  //       switch (event) {
  //         case "SIGNED_IN":
  //           if (session?.user) {
  //             const metadata = session.user.user_metadata;
  //             if (!metadata.encryptionSalt) {
  //               throw new Error("No encryption salt found in user metadata");
  //             }
  //           }
  //           break;
  //         case "SIGNED_OUT":
  //           console.log("Signed out");

  //           if (getSessionKey()) clearSessionKey();
  //           break;
  //       }
  //       onAuthChange?.(session);
  //     });

  //     return () => {
  //       listener.subscription.unsubscribe();
  //     };
  //   }, [supabase, onAuthChange]);

  return null; // This component doesn't render anything
};

export default AuthListener;
