document.addEventListener("DOMContentLoaded", () => {
  const profileBtn = document.getElementById("profileBtn");
  const profileMenu = document.getElementById("profileMenu");
  const profileName = document.getElementById("profileName");
  const profilePhone = document.getElementById("profilePhone");

  const signIn = document.getElementById("profileSignIn");
  const orders = document.getElementById("profileOrders");
  const signOut = document.getElementById("profileSignOut");

  const wrapper = document.getElementById("profileWrapper");

  function getCustomer() {
    try {
      return JSON.parse(
        localStorage.getItem("pkk_customer_v1") || "null"
      );
    } catch {
      return null;
    }
  }

  function updateProfile() {
    const customer = getCustomer();

    if (customer && customer.name && customer.phone) {
      profileName.textContent = customer.name;
      profilePhone.textContent = customer.phone;

      signIn.classList.add("hidden");
      orders.classList.remove("hidden");
      signOut.classList.remove("hidden");
    } else {
      profileName.textContent = "Welcome, Guest";
      profilePhone.textContent = "Please sign in";

      signIn.classList.remove("hidden");
      orders.classList.add("hidden");
      signOut.classList.add("hidden");
    }
  }

  function closeProfile() {
    profileMenu.classList.add("hidden");
    profileBtn.setAttribute("aria-expanded", "false");
  }

  profileBtn.addEventListener("click", () => {
    updateProfile();

    profileMenu.classList.toggle("hidden");

    profileBtn.setAttribute(
      "aria-expanded",
      String(!profileMenu.classList.contains("hidden"))
    );
  });

  signIn.addEventListener("click", () => {
    closeProfile();
    document.getElementById("customer")
      ?.scrollIntoView({ behavior: "smooth" });
  });

 orders.addEventListener("click", () => {
  closeProfile();
  window.location.href = "order-history.html";
});
  signOut.addEventListener("click", () => {
    closeProfile();

    // Use the existing application's logout handler.
    const existingSignOut =
      document.getElementById("customerSignOut");

    if (existingSignOut) {
      existingSignOut.click();
    } else {
      localStorage.removeItem("pkk_customer_v1");
    }

    updateProfile();
    window.dispatchEvent(new Event("storage"));
  });

  document.addEventListener("click", (event) => {
    if (!wrapper.contains(event.target)) {
      closeProfile();
    }
  });

  window.addEventListener("storage", updateProfile);

  updateProfile();
});