export function formatActionName(action: string): string {
  if (!action) return 'Unknown Action';
  return action
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function formatLogDetails(action: string, details: string): string {
  try {
    const data = JSON.parse(details);
    if (!data || Object.keys(data).length === 0) return "Action executed";

    switch (action) {
      case 'GRANTED_CURRENCY':
      case 'DEDUCTED_CURRENCY':
        const verb = action === 'GRANTED_CURRENCY' ? 'Granted' : 'Deducted';
        return `${verb} ${data.amount} ${data.type}`;
      case 'EDITED_GAMIFICATION':
        const editVerb = data.actionType === 'ADD' ? 'Added' : data.actionType === 'SUBTRACT' ? 'Subtracted' : 'Set';
        return `${editVerb} ${data.value} ${data.target}`;
      case 'REPORT_RESOLVED':
        return `Resolved report ${data.reportId}`;
      case 'VERIFICATION_APPROVED':
        return `Approved verification for student ${data.studentId}`;
      case 'VERIFICATION_REJECTED':
        return `Rejected verification for student ${data.studentId}`;
      case 'PURCHASED_ITEM':
        return `Purchased item ${data.shopItemId} for ${data.price} ${data.currency}`;
      case 'USER_BANNED':
        return `Banned user. Reason: ${data.reason || 'None specified'}`;
      case 'USER_UNBANNED':
        return `Unbanned user`;
      case 'SENT_NOTIFICATION':
        return `Sent notification: "${data.title}"`;
      case 'CREATED_MISSION':
        return `Created mission: ${data.title}`;
      case 'UPDATED_MISSION':
        return `Updated mission: ${data.title}`;
      case 'DELETED_MISSION':
        return `Deleted mission: ${data.missionId}`;
      case 'GRANTED_ACHIEVEMENT':
        return `Granted achievement: ${data.name || data.achievementId}`;
      case 'CREATED_ACHIEVEMENT':
        return `Created achievement: ${data.name}`;
      case 'UPDATED_ACHIEVEMENT':
        return `Updated achievement: ${data.name}`;
      case 'DELETED_ACHIEVEMENT':
        return `Deleted achievement: ${data.name}`;
      case 'CREATED_SHOP_ITEM':
        return `Created shop item: ${data.title}`;
      case 'UPDATED_SHOP_ITEM':
        return `Updated shop item: ${data.title}`;
      case 'DELETED_SHOP_ITEM':
        return `Deleted shop item: ${data.title}`;
      case 'DELETED_USER':
        return `Deleted user account`;
      case 'CREATED_REPORT':
        return `Submitted a report (${data.type})`;
      case 'USER_REGISTERED':
        return `Registered new account (${data.email})`;
      case 'UPDATED_PROFILE':
        return `Updated profile fields: ${(data.updatedFields || []).join(', ')}`;
      case 'UPDATED_SETTINGS':
        return `Updated settings: ${(data.updatedFields || []).join(', ')}`;
      case 'CHANGED_PASSWORD':
        return `Changed password`;
      case 'DELETED_ACCOUNT':
        return `Deleted their account`;
      case 'OTP_REQUESTED':
        return `Requested an email verification code`;
      default:
        // Try to construct a readable sentence if generic
        const parts = Object.entries(data).map(([k, v]) => `${k}: ${v}`);
        if (parts.length > 0 && parts.length <= 3) {
          return `${formatActionName(action)} - ${parts.join(', ')}`;
        }
        return "Action executed";
    }
  } catch (e) {
    return "Action executed";
  }
}
