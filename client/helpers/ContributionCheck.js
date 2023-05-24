export function ContributionCheck(userCredits, meeData) {
  return (localStorage.getItem('payment') === undefined || localStorage.getItem('payment') === null) && (localStorage.getItem('ispaid') === null || localStorage.getItem('ispaid') === undefined || localStorage.getItem('ispaid') === 'false') && (userCredits === 10 || userCredits === 20) && !meeData?.me?.isSubscribed;
}
